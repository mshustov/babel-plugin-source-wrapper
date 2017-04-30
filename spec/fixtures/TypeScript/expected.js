"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SomeClass = exports.SomeClass = function () {
    function SomeClass() {
        _classCallCheck(this, SomeClass);
    }

    _createClass(SomeClass, [{
        key: "someMethod",
        value: (testWrapper)(function someMethod() {}, {
            loc: "{{path}}:6:20:8:4"
        })
    }]);

    return SomeClass;
}();

(testWrapper)(SomeClass, {
    loc: "{{path}}:5:7:9:2",
    type: "class",
    methods: {
        someMethod: "{{path}}:6:10:8:4"
    }
}, true);
var some = exports.some = (testWrapper)(new SomeClass(), {
    loc: "{{path}}:11:21:11:52"
}, true);
//# sourceMappingURL=source.js.map