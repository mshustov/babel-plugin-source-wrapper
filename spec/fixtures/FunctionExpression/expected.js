"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var b = (testWrapper)(function () {
    return 2;
}, {
    loc: "{{path}}:1:9:1:30"
});

var expression = (testWrapper)(function () {
    return 1;
}, {
    loc: "{{path}}:3:25:5:2"
});
exports.expression = expression;
