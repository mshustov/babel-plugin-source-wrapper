"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ref, _ref2, _ref3;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var FOO = (testWrapper)((_ref = {}, _defineProperty(_ref, props.FOO, 1), _defineProperty(_ref, props.BAR, (testWrapper)(function () {
    return 2;
}, {
    loc: "{{path}}:3:18:3:25"
})), _ref), {
    loc: "{{path}}:1:13:4:2",
    map: {}
});

var BAR = exports.BAR = (testWrapper)((_ref2 = {}, _defineProperty(_ref2, props.FOO, 1), _defineProperty(_ref2, props.BAR, (testWrapper)(function () {
    return 2;
}, {
    loc: "{{path}}:8:18:8:25"
})), _ref2), {
    loc: "{{path}}:6:18:9:2",
    map: {}
});

(testWrapper)(fn((testWrapper)((_ref3 = {}, _defineProperty(_ref3, props.FOO, 1), _defineProperty(_ref3, props.BAR, (testWrapper)(function () {
    return 2;
}, {
    loc: "{{path}}:13:18:13:25"
})), _ref3), {
    loc: "{{path}}:11:4:14:2",
    map: {}
})), {
    loc: "{{path}}:11:1:14:3"
});
