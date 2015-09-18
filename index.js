var Minimatch = require('minimatch').Minimatch;

module.exports = function(options){
    var registratorName = options.registratorName;
    var blackbox = false;

    if ('blackbox' in options === false || options.blackbox == null) {
        blackbox = [
            '/bower_compontents/**',
            '/node_modules/**'
        ];
    } else {
        if (Array.isArray(options.blackbox)) {
            blackbox = options.blackbox;
        } else {
            if (blackbox !== false) {
                console.warn('[' + require('./package.json').name + '] Wrong value for blackbox option');
            }
        }
    }

    if (Array.isArray(blackbox)) {
        blackbox = blackbox.map(function(str){
            return new Minimatch(str);
        });
    }

    function isBlackbox(filename){
        return blackbox && blackbox.some(function(mm){
            return mm.match(filename);
        });
    }

    function calcLocation(file, node){
        return [
            file.opts.filename || 'unknown',
            node.loc.start.line,
            node.loc.start.column + 1,
            node.loc.end.line,
            node.loc.end.column + 1
        ].join(':');
    }

    return function (_ref) {
        var Plugin = _ref.Plugin;
        var t = _ref.types;

        function getLocation(file, node){
            if (node.loc) {
                return calcLocation(file, node);
            }

            if (t.isCallExpression(node) && node.callee.name === registratorName) {
                return calcLocation(file, node.arguments[0]); // or get loc from node.arguments[1]... ?s
            }

            return null;
        }

        function extend(dest, source){
            for (var key in source)
                if (Object.prototype.hasOwnProperty.call(source, key))
                    dest[key] = source[key];

            return dest;
        }

        function createInfoObject(loc, isBlackbox, extra){
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

        function wrapNodeReference(loc, name, isBlackbox){
            return t.expressionStatement(
                t.callExpression(t.identifier(registratorName), [
                    t.identifier(name),
                    createInfoObject(loc, isBlackbox)
                ])
            );
        }

        function wrapNode(loc, node, isBlackbox, force){
            var args = [
                node,
                createInfoObject(loc, isBlackbox)
            ];

            if (force) {
                args.push(t.literal(true));
            }

            return t.callExpression(t.identifier(registratorName), args);
        }

        function wrapObjectNode(loc, node, isBlackbox, map){
            return t.callExpression(t.identifier(registratorName), [
                node,
                createInfoObject(loc, isBlackbox, [
                    t.property(
                        'init',
                        t.identifier('map'),
                        t.objectExpression(map)
                    )
                ])
            ]);
        }

        function buildMap(node, getLocation){
            return node.properties.reduce(function(result, property){
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
                shouldSkip: function(path){
                    return path.node.skip_;
                },

                'FunctionDeclaration|ClassDeclaration': function(node, parent, scope, file){
                    var loc = getLocation(file, node);
                    var node = wrapNodeReference(loc, node.id.name, isBlackbox(file.opts.filename));
                    node.skip_ = true;
                    this.insertAfter(node);
                },

                'FunctionExpression|ArrowFunctionExpression|ClassExpression|ArrayExpression|JSXElement': {
                    exit: function(node, parent, scope, file){
                        // don't wrap class constructor as Babel fail on super call check
                        if (parent.type == 'MethodDefinition' && parent.key.name == 'constructor') {
                            return;
                        }

                        this.skip();
                        var loc = getLocation(file, node);
                        return wrapNode(loc, node, isBlackbox(file.opts.filename));
                    }
                },

                NewExpression:  {
                    exit: function(node, parent, scope, file){
                        this.skip();
                        var loc = getLocation(file, node);
                        return wrapNode(loc, node, isBlackbox(file.opts.filename), true);
                    }
                },

                ObjectExpression: {
                    enter: function(node, parent, scope, file){
                        this.setData('map', buildMap(node, getLocation.bind(null, file)));
                    },
                    exit: function(node, parent, scope, file){
                        this.skip();
                        var loc = getLocation(file, node);
                        var map = this.getData('map');
                        return wrapObjectNode(loc, node, isBlackbox(file.opts.filename), map);
                    }
                },
                CallExpression: {
                    exit: function(node, parent, scope, file){
                        // add to another test
                        if (t.isMemberExpression(node.callee) && !node.callee.computed){
                            var loc = getLocation(file, node);
                            return wrapNode(loc, node, isBlackbox(file.opts.filename));
                        }
                    }
                }
            }
        });
    };
};
