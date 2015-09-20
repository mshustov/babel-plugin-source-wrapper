var Minimatch = require('minimatch').Minimatch;
var path = require('path');

var createPluginFactory = function(options) {
    var registratorName = options.registratorName || '$devinfo';
    var basePath = options.basePath || false;
    var blackbox = [
        '/bower_compontents/**',
        '/node_modules/**'
    ];

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

        function wrapNodeReference(loc, name) {
            return t.expressionStatement(
                t.callExpression(t.identifier(registratorName), [
                    t.identifier(name),
                    createInfoObject(loc)
                ])
            );
        }

        function wrapNode(loc, node, force) {
            var args = [
                node,
                createInfoObject(loc)
            ];

            if (force) {
                args.push(t.literal(true));
            }

            return t.callExpression(t.identifier(registratorName), args);
        }

        function wrapObjectNode(loc, node, map) {
            return t.callExpression(t.identifier(registratorName), [
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
                },

                shouldSkip: function(path) {
                    return path.node.skip_;
                },

                'FunctionDeclaration|ClassDeclaration': function(node, parent, scope, file) {
                    var loc = getLocation(node);
                    var node = wrapNodeReference(loc, node.id.name);
                    node.skip_ = true;
                    this.insertAfter(node);
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
                        // add to another test
                        if (t.isMemberExpression(node.callee) && !node.callee.computed) {
                            var loc = getLocation(node);
                            return wrapNode(loc, node);
                        }
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
