"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Foo = (testWrapper)(function Foo() {
    _classCallCheck(this, Foo);

    this.foo = 123;
}, {
    loc: "{{path}}:2:5:4:6"
});
(testWrapper)(Foo, {
    loc: "{{path}}:1:1:5:2",
    type: "class"
});

var Foo2 = function (_Foo) {
    _inherits(Foo2, _Foo);

    function Foo2() {
        _classCallCheck(this, Foo2);

        return _possibleConstructorReturn(this, (Foo2.__proto__ || Object.getPrototypeOf(Foo2)).call(this));
    }

    (testWrapper)(Foo2, {
        loc: "{{path}}:8:5:10:6"
    });
    return Foo2;
}(Foo);

(testWrapper)(Foo2, {
    loc: "{{path}}:7:1:11:2",
    type: "class"
});
var Bar = exports.Bar = (testWrapper)(function Bar() {
    _classCallCheck(this, Bar);

    this.bar = 123;
}, {
    loc: "{{path}}:14:5:16:6"
});
(testWrapper)(Bar, {
    loc: "{{path}}:13:8:17:2",
    type: "class"
});

var Bar2 = exports.Bar2 = function (_Bar) {
    _inherits(Bar2, _Bar);

    function Bar2() {
        _classCallCheck(this, Bar2);

        return _possibleConstructorReturn(this, (Bar2.__proto__ || Object.getPrototypeOf(Bar2)).call(this));
    }

    (testWrapper)(Bar2, {
        loc: "{{path}}:20:5:22:6"
    });
    return Bar2;
}(Bar);

(testWrapper)(Bar2, {
    loc: "{{path}}:19:8:23:2",
    type: "class"
});
