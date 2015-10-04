var Minimatch = require('minimatch').Minimatch;
var path = require('path');
var runtimeScript = require('fs').readFileSync(__dirname + '/runtime.min.js', 'utf-8');

var createPluginFactory = function(options) {
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

    function isBlackboxFile(filename) {
        return blackbox && blackbox.some(function(mm) {
            return mm.match(filename);
        });
    }

    function calcLocation(filename, node) {
        return [
            filename,
            node.loc.start.line,
            node.loc.start.column + 1,
            node.loc.end.line,
            node.loc.end.column + 1
        ].join(':');
    }

    return function(_ref) {
        var Plugin = _ref.Plugin;
        var t = _ref.types;
        var filename = 'unknown';
        var isBlackbox = false;

        if (!Plugin) {
            console.warn('Usage `require("babel-plugin-source-wrapper")(options)` is deprecated, use `require("babel-plugin-source-wrapper").configure(options)` instead.');
            return createPluginFactory(_ref);
        }

        function getLocation(node) {
            if (node.loc) {
                return calcLocation(filename, node);
            }

            if (t.isCallExpression(node) && node.callee.name === registratorName) {
                return calcLocation(filename, node.arguments[0]); // or get loc from node.arguments[1]... ?s
            }

            return null;
        }

        function extend(dest, source) {
            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    dest[key] = source[key];
                }
            }

            return dest;
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
                properties.push(t.property(
                    'init',
                    t.identifier('loc'),
                    t.literal(loc)
                ));
            }

            if (isBlackbox) {
                properties.push(t.property(
                    'init',
                    t.identifier('blackbox'),
                    t.literal(true)
                ));
            }

            if (extra) {
                properties = properties.concat(extra);
            }

            return t.objectExpression(properties);
        }

        function wrapNodeReference(loc, node) {
            var wrapper = t.expressionStatement(
                createRegistratorCall([
                    t.identifier(node.id.name),
                    createInfoObject(loc)
                ])
            );

            wrapper.skip_ = true;

            return wrapper;
        }

        function wrapNode(loc, node, force) {
            var args = [
                node,
                createInfoObject(loc)
            ];

            if (force) {
                args.push(t.literal(true));
            }

            return createRegistratorCall(args);
        }

        function wrapObjectNode(loc, node, map) {
            return createRegistratorCall([
                node,
                createInfoObject(loc, [
                    t.property(
                        'init',
                        t.identifier('map'),
                        t.objectExpression(map)
                    )
                ])
            ]);
        }

        function buildMap(node) {
            return node.properties.reduce(function(result, property) {
                if (!property.computed && property.kind == 'init') {
                    var value = property.value;
                    var location = getLocation(value);

                    result.push(
                        t.property(
                            'init',
                            extend({}, property.key),
                            t.literal(location)
                        )
                    );
                }

                return result;
            }, []);
        }

        function wrapDecoratorNode(node, decoratorLoc, classLoc) {
            var args = [
                node.expression,
                createInfoObject(decoratorLoc)
            ];

            if (classLoc) {
                args.push(createInfoObject(classLoc));
            }

            node.expression = t.callExpression(
                t.memberExpression(
                    t.identifier(registratorName),
                    t.identifier('wrapDecorator')
                ),
                args
            );
        }

        return new Plugin('babel-plugin-source-wrapper', {
            metadata: { secondPass: false },
            visitor: {
                // init common things for all nodes
                Program: function(node, parent, scope, file) {
                    filename = 'unknown';

                    if (file.opts.filename) {
                        filename = file.opts.filename;
                        if (basePath) {
                            var relativePath = path.relative(basePath, file.opts.filename);
                            if (relativePath[0] != '.') {
                                filename = '/' + relativePath;
                            }
                        }
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

                shouldSkip: function(path) {
                    // don't wrap arguments of `require.ensure` calls as webpack fails
                    // TODO: find the way to safe wrapping
                    if (path.node.type === 'CallExpression' &&
                        path.node.callee.object &&
                        path.node.callee.object.name === 'require' &&
                        path.node.callee.property.name === 'ensure') {
                        return true;
                    }

                    return path.node.skip_;
                },

                FunctionDeclaration: function(node, parent, scope, file) {
                    var loc = getLocation(node);
                    
                    this.insertAfter(
                        wrapNodeReference(loc, node)
                    );
                },

                ClassDeclaration: function(node, parent, scope, file) {
                    // don't wrap a class declaration with decorators, since
                    // it is unlikely that we will have the correct reference
                    // to the class; info will be attached in first applied
                    // decorator
                    if (node.decorators) {
                        return;
                    }

                    // if no decorators wrap class declaration reference
                    var loc = getLocation(node);

                    this.insertAfter(
                        wrapNodeReference(loc, node)
                    );
                },

                'FunctionExpression|ArrowFunctionExpression|ClassExpression|ArrayExpression|JSXElement': {
                    exit: function(node, parent, scope, file) {
                        // don't wrap class constructor as Babel fail on super call check
                        if (parent.type == 'MethodDefinition' && parent.key.name == 'constructor') {
                            return;
                        }

                        this.skip();
                        var loc = getLocation(node);
                        return wrapNode(loc, node);
                    }
                },

                NewExpression:  {
                    exit: function(node, parent, scope, file) {
                        this.skip();
                        var loc = getLocation(node);
                        return wrapNode(loc, node, true);
                    }
                },

                ObjectExpression: {
                    enter: function(node, parent, scope, file) {
                        this.setData('map', buildMap(node));
                    },
                    exit: function(node, parent, scope, file) {
                        this.skip();
                        var loc = getLocation(node);
                        var map = this.getData('map');
                        return wrapObjectNode(loc, node, map);
                    }
                },

                CallExpression: {
                    exit: function(node, parent, scope, file) {
                        // TODO: add comment what is filtering here
                        if (t.isMemberExpression(node.callee) && !node.callee.computed) {
                            var loc = getLocation(node);
                            return wrapNode(loc, node);
                        }
                    }
                },

                Decorator: {
                    exit: function(node, parent, scope, file) {
                        // process class declaration decorators only
                        if (parent.type != 'ClassDeclaration') {
                            return;
                        }

                        this.skip();
                        var decoratorLoc = getLocation(node);
                        var classLoc;

                        if (node === parent.decorators[parent.decorators.length - 1]) {
                            classLoc = getLocation(parent);
                        }

                        return wrapDecoratorNode(node, decoratorLoc, classLoc);
                    }
                }
            }
        });
    };
};

module.exports = createPluginFactory({});
module.exports.configure = function(options) {
    return createPluginFactory(options || {});
};
