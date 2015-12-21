"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.declaration = declaration;
var sum = (testWrapper)(function (a) {
    return (testWrapper)(function (b) {
        return a + b;
    }, {
        loc: "{{path}}:2:12:4:6"
    });
}, {
    loc: "{{path}}:1:11:5:2"
});

function declaration() {
    return 1;
}

(testWrapper)(declaration, {
    loc: "{{path}}:7:8:9:2"
});
