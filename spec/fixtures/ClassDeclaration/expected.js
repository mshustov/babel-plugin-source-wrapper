"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var Foo = function Foo() {
    _classCallCheck(this, Foo);

    this.foo = 123;
};

(testWrapper)(Foo, {
    loc: "{{path}}:1:1:5:2",
    type: "class"
});

var Foo2 = (function (_Foo) {
    _inherits(Foo2, _Foo);

    function Foo2() {
        _classCallCheck(this, Foo2);

        _get(Object.getPrototypeOf(Foo2.prototype), "constructor", this).call(this);
    }

    return Foo2;
})(Foo);

(testWrapper)(Foo2, {
    loc: "{{path}}:7:1:11:2",
    type: "class"
});

var Bar = function Bar() {
    _classCallCheck(this, Bar);

    this.bar = 123;
};

exports.Bar = Bar;
(testWrapper)(Bar, {
    loc: "{{path}}:13:8:17:2",
    type: "class"
});

var Bar2 = (function (_Bar) {
    _inherits(Bar2, _Bar);

    function Bar2() {
        _classCallCheck(this, Bar2);

        _get(Object.getPrototypeOf(Bar2.prototype), "constructor", this).call(this);
    }

    return Bar2;
})(Bar);

exports.Bar2 = Bar2;
(testWrapper)(Bar2, {
    loc: "{{path}}:19:8:23:2",
    type: "class"
});
