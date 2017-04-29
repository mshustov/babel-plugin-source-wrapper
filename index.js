var SourceMapConsumer = require('source-map').SourceMapConsumer;
var Minimatch = require('minimatch').Minimatch;
var pathFS = require('path');
var runtimeScript = require('fs').readFileSync(__dirname + '/runtime.min.js', 'utf-8');

var getOptionsFromFile = function(file) {
    if (file.opts.extra && file.opts.extra['source-wrapper']) {
        return file.opts.extra['source-wrapper'];
    }
};

var normalizeOptions = function(options) {
    var registratorName = options.registratorName || '$devinfo';
    var runtime = '';
    var basePath = options.basePath || false;
    var blackbox = [
        '/bower_compontents/**',
        '/node_modules/**'
    ];

    if (options.runtime) {
        runtime = runtimeScript;
    }

    if ('blackbox' in options !== false && options.blackbox != null) {
        if (Array.isArray(options.blackbox)) {
            blackbox = options.blackbox;
        } else {
            if (blackbox !== false) {
                console.warn('[' + require('./package.json').name + '] Wrong value for blackbox option');
            }
        }
    }

    if (Array.isArray(blackbox)) {
        blackbox = blackbox.map(function(str) {
            return new Minimatch(str);
        });
    }

    return {
        registratorName: registratorName,
        runtime: runtime,
        blackbox: blackbox,
        basePath: basePath
    };
};

var createPluginFactory = function(options) {
    var registratorName;
    var runtime;
    var basePath;
    var blackbox;
    var applyOptions = function(options) {
        if (!options) {
            return;
        }

        options = normalizeOptions(options);

        registratorName = options.registratorName;
        runtime = options.runtime;
        basePath = options.basePath;
        blackbox = options.blackbox;

        applyOptions = function() {};
    };

    function isBlackboxFile(filename) {
        return blackbox && blackbox.some(function(mm) {
            return mm.match(filename);
        });
    }

    function calcLocation(filename, sourceMap, node) {
        var startPosition = {
            line: node.loc.start.line,
            column: node.loc.start.column + 1,
        };
        var endPosition = {
            line: node.loc.end.line,
            column: node.loc.end.column + 1,
        };

        if (sourceMap) {
            var originalStartPosition = sourceMap.originalPositionFor(startPosition);
            var originalEndPosition = sourceMap.originalPositionFor(endPosition);

            if (typeof originalStartPosition.line === 'number' && typeof originalStartPosition.column === 'number') {
                startPosition = {
                    line: originalStartPosition.line,
                    column: originalStartPosition.column + 1,
                };
            }

            if (typeof originalEndPosition.line === 'number' && typeof originalEndPosition.column === 'number') {
                endPosition = {
                    line: originalEndPosition.line,
                    column: originalEndPosition.column + 1,
                };
            }
        }

        return [
            filename,
            startPosition.line,
            startPosition.column,
            endPosition.line,
            endPosition.column
        ].join(':');
    }

    function getComputedLoc(node){
        if (node.callee.property.loc && node.loc){
            return {
                loc: {
                    start: node.callee.property.loc.start,
                    end: node.loc.end
                }
            }
        }
    }

    function extend(dest, source) {
        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                dest[key] = source[key];
            }
        }

        return dest;
    }

    return function(_ref) {
        var t = _ref.types;
        var filename;
        var sourceMap;
        var isBlackbox = false;
        var shouldSkipNode = new WeakSet();

        function getLocation(node) {
            if (node) {
                if (node.loc) {
                    return calcLocation(filename, sourceMap, node);
                }

                if (t.isCallExpression(node) && node.callee.name === registratorName) {
                    return calcLocation(filename, sourceMap, node.arguments[0]); // or get loc from node.arguments[1]... ?
                }

                if (t.isFunctionExpression(node) && !node.loc && node.body.loc) {
                    return calcLocation(filename, sourceMap, node.body); // only function body
                }
            }
            return null;
        }

        function simpleProperty(name, value) {
            return t.objectProperty(
                t.identifier(name),
                value
            );
        }

        function createRegistratorCall(args) {
            return t.callExpression(
                // Sequence expression helps avoid registratorName including
                // to generated names in Blink (other browser no make sence).
                // It reduces noise in call stack output, i.e.
                //   var a = { x: $devinfo(function(){ .. }) };    // function name is `a.x.$devinfo`
                //   var a = { x: ($devinfo)(function(){ .. }) };  // function name is `a.x`
                //
                // Looks like a hack, but works.
                t.sequenceExpression([
                    t.identifier(registratorName)
                ]),
                args
            );
        }

        function createInfoObject(loc, extra) {
            var properties = [];

            if (loc) {
                properties.push(simpleProperty('loc', t.stringLiteral(loc)));
            }

            if (isBlackbox) {
                properties.push(
                    simpleProperty('blackbox', t.booleanLiteral(true))
                );
            }

            if (extra) {
                properties = properties.concat(extra);
            }

            return t.objectExpression(properties);
        }

        function wrapNodeReference(loc, node, type) {
            return t.expressionStatement(
                createRegistratorCall([
                    t.identifier(node.id.name),
                    createInfoObject(
                        loc,
                        type ? [simpleProperty('type',t.stringLiteral('class'))] : null
                    )
                ])
            );
        }

        function wrapNode(loc, node, force) {
            var args = [
                node,
                createInfoObject(loc)
            ];

            if (force) {
                args.push(t.booleanLiteral(true));
            }

            return createRegistratorCall(args);
        }

        function wrapObjectNode(loc, node, map) {
            return createRegistratorCall([
                node,
                createInfoObject(loc, [
                    t.objectProperty(
                        t.identifier('map'),
                        t.objectExpression(map)
                    )
                ])
            ]);
        }

        function buildMap(node) {
            return node.properties.reduce(function(result, property) {
                var value = property.value;
                if (!property.computed && value) {
                    var location = getLocation(value);
                    if (location) {
                        result.push(
                            t.objectProperty(
                                extend({}, property.key),
                                t.stringLiteral(location)
                            )
                        );
                    }
                }

                return result;
            }, []);
        }

        function getDecoratorName(node, signature) {
            var expression = node.expression;

            switch (expression.type) {
                case 'Identifier':
                    return expression.name;

                case 'CallExpression':
                    if (expression.callee.type === 'Identifier') {
                        var postfix = '';

                        if (signature) {
                            postfix = '(' +
                                (expression.arguments.length ? '\u2026' : '') + // '…'
                            ')';
                        }

                        return expression.callee.name + postfix;
                    }
                    break;
            }
        }

        function buildDecoratorList(decorators) {
            return t.arrayExpression(decorators.map(function(decorator) {
                var name = getDecoratorName(decorator);
                var properties = [
                    simpleProperty('loc', t.stringLiteral(getLocation(decorator))),
                    simpleProperty('name', t.stringLiteral(name ? getDecoratorName(decorator, true) : 'unknown'))
                ];

                if (name) {
                    properties.push(
                        t.property(
                            'init',
                            t.identifier('fn'),
                            t.identifier(name)
                        )
                    );
                }

                return t.objectExpression(properties);
            }));
        }

        function wrapDecoratorNode(node, loc, index, classInfo) {
            var args = [
                node.expression,
                t.objectExpression([
                    simpleProperty('index', t.stringLiteral(index)),
                    simpleProperty('target', t.nullLiteral())
                ])
            ];

            if (classInfo) {
                args.push(classInfo);
            }

            node.expression = t.callExpression(
                t.memberExpression(
                    t.identifier(registratorName),
                    t.identifier('wrapDecorator')
                ),
                args
            );
        }

        return {
            visitor: {
                // init common things for all nodes
                Program: function(path, data) {
                    var node = path.node;
                    var file = data.file;
                    applyOptions(getOptionsFromFile(file) || data.opts);

                    filename = 'unknown';

                    if (file.opts.filename) {
                        filename = file.opts.filename;
                        if (basePath) {
                            var relativePath = pathFS.relative(basePath, file.opts.filename);
                            if (relativePath[0] != '.') {
                                filename = '/' + relativePath;
                            }
                        }
                    }

                    if (file.opts.inputSourceMap) {
                        sourceMap = new SourceMapConsumer(file.opts.inputSourceMap);
                    }

                    isBlackbox = isBlackboxFile(filename);
                    // inject runtime if necessary
                    // current implementation weird and actually a hack
                    // TODO: find correct way to this
                    if (runtime) {
                        var injection = t.identifier(runtime);
                        node.body.unshift(t.expressionStatement(injection));
                    }
                },

                FunctionDeclaration: function(path, file) {
                    var node = path.node;
                    var loc = getLocation(node);
                    var insertPath = path;
                    var parent = path.parent;

                    if (t.isExportDefaultDeclaration(parent) || t.isExportNamedDeclaration(parent)) {
                        insertPath = path.parentPath;
                    }

                    if (loc) {
                        insertPath.insertAfter(wrapNodeReference(loc, node));
                    }
                },

                ClassDeclaration: function(path, file) {
                    // don't wrap a class declaration with decorators, since
                    // it is unlikely that we will have the correct reference
                    // to the class; info will be attached in first applied
                    // decorator
                    var node = path.node;
                    var parent = path.parent;

                    if (node.decorators) {
                        var lastDecorator = node.decorators[node.decorators.length - 1];
                        lastDecorator.devClassInfo = createInfoObject(
                            getLocation(node),
                            [
                                simpleProperty('type', 'class'),
                                t.property(
                                    'init',
                                    t.identifier('decorators'),
                                    buildDecoratorList(node.decorators)
                                )
                            ]
                        );
                        return;
                    }

                    // if no decorators wrap class declaration reference
                    var loc = getLocation(node);
                    var insertPath = path;

                    if (t.isExportDefaultDeclaration(parent) || t.isExportNamedDeclaration(parent)) {
                        insertPath = path.parentPath;
                    }

                    insertPath.insertAfter(wrapNodeReference(loc, node, 'class'));
                },

                'FunctionExpression|ArrowFunctionExpression|ClassExpression|ArrayExpression|JSXElement': {
                    exit: function(path, file) {
                        // don't wrap class constructor as Babel fail on super call check
                        if (shouldSkipNode.has(path.node)){
                            return;
                        }

                        var node = path.node;
                        var loc = getLocation(node);
                        if (loc){
                            shouldSkipNode.add(node);
                            path.replaceWith(wrapNode(loc, node));
                        }
                    }
                },

                NewExpression:  {
                    exit: function(path, file) {
                        if (shouldSkipNode.has(path.node)){
                            return;
                        }

                        var node = path.node;
                        var loc = getLocation(node);
                        if (loc) {
                            shouldSkipNode.add(node);
                            path.replaceWith(wrapNode(loc, node, true));
                        }
                    }
                },

                ObjectExpression: {
                    enter: function(path, file) {
                        path.setData('map', buildMap(path.node));
                    },
                    exit: function(path, file) {
                        if (shouldSkipNode.has(path.node)){
                            return;
                        }

                        var node = path.node;
                        var loc = getLocation(node);
                        if (loc) {
                            shouldSkipNode.add(node);
                            var map = path.getData('map');
                            path.replaceWith(wrapObjectNode(loc, node, map));
                        }
                    }
                },

                CallExpression: {
                    enter: function(path, file) {
                        // in sake of webpack compatibility
                        // don't wrap require.ensure and define instructions
                        // and their child
                        // TODO: find the way for safe wrapping
                        if (path.node.callee.object &&
                            path.node.callee.object.name === 'require' &&
                            path.node.callee.property.name === 'ensure' || t.isIdentifier(path.node.callee, { name: 'define' })) {

                            shouldSkipNode.add(path.node);
                            path.node.arguments.forEach(function(node) {
                                shouldSkipNode.add(node);
                            });

                            return;
                        }
                    },
                    exit: function(path, file) {
                        if (shouldSkipNode.has(path.node)) {
                            return;
                        }

                        var node = path.node;
                        var loc = !t.isMemberExpression(node.callee) || node.callee.computed
                            ? getLocation(node)
                            : getLocation(getComputedLoc(node));

                        if (loc) {
                            shouldSkipNode.add(node);
                            path.replaceWith(wrapNode(loc, node));
                        }
                    }
                }
            }
        };
    };
};

module.exports = createPluginFactory({});

module.exports.configure = function(options) {
    return createPluginFactory(options || {});
};
