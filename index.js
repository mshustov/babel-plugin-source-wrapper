'use strict';

module.exports = function(options){
    var registratorName = options.registratorName;
    var blacklistArray = options.blacklist;
    var Minimatch = require("minimatch").Minimatch;
    var blacklistMM = null;

    if(blacklistArray){
        blacklistMM = blacklistArray.map(function(str) {
            return new Minimatch(str, { /* options */ });
        })
    }

    function inBlackList(filename){
        return blacklistMM && blacklistMM.some(function(mm) {
            return mm.match(filename);
        })
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
            if(!file || !file.opts.filename){
                debugger;
            }
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

        function wrapNodeReference(loc, name, isBlackbox){
            return t.expressionStatement(
                t.callExpression(t.identifier(registratorName), [
                    t.identifier(name),
                    t.objectExpression([
                        t.property(
                            'init',
                            t.identifier('loc'),
                            t.literal(loc)
                        ),
                        t.property(
                            'init',
                            t.identifier('blackbox'),
                            t.literal(isBlackbox)
                        )
                    ])
                ])
            );
        }

        //TODO fix API
        function wrapNode(loc, node, isBlackbox){
            return t.callExpression(
                t.identifier(registratorName),
                [
                    node,
                    t.objectExpression([
                        t.property(
                            'init',
                            t.identifier('loc'),
                            t.literal(loc)
                        ),
                        t.property(
                            'init',
                            t.identifier('blackbox'),
                            t.literal(isBlackbox)
                        )
                    ])
                ]);
        }

        function wrapObjectNode(loc, node, isBlackbox, map){
            return t.callExpression(t.identifier(registratorName), [
                node,
                t.objectExpression([
                    t.property(
                        'init',
                        t.identifier('loc'),
                        t.literal(loc)
                    ),
                    t.property(
                        'init',
                        t.identifier('blackbox'),
                        t.literal(isBlackbox)
                    ),
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
                
                FunctionDeclaration: function(node, parent, scope, file){
                    var loc = getLocation(file, node);
                    //var node = wrapNodeReference(loc, node.id.name);
                    node.skip_ = true;
                    this.insertAfter(wrapNodeReference(loc, node.id.name, inBlackList(file.opts.filename)));

                },

                'FunctionExpression|ArrowFunctionExpression|ClassExpression|NewExpression|ArrayExpression': {
                // FIXME keep function name
                    exit: function(node, parent, scope, file){
                        this.skip();
                        var loc = getLocation(file, node);
                        return wrapNode(loc, node, inBlackList(file.opts.filename));
                    }
                },

                ObjectExpression: {
                    enter: function(node, parent, scope, file){
                        this.setData('map', buildMap(node, getLocation.bind(null, file)));
                    },
                    exit: function(node, parent, scope, file){
                        this.skip();
                        var loc = getLocation(file, node);
                        if (loc) { // FIXME
                            var map = this.getData('map');
                            return wrapObjectNode(loc, node, inBlackList(file.opts.filename), map);
                        }
                    }
                },
                CallExpression: {
                    exit: function(node, parent, scope, file){
                        //this.skip();

                        if (t.isMemberExpression(node.callee) && !node.callee.computed){
                            var loc = getLocation(file, node);
                            return wrapNode(loc, node, inBlackList(file.opts.filename));
                        }
                    }
                }

            }
        });
    };
};
