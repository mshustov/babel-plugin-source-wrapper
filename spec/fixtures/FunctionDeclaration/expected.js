"use strict";

var sum = testWrapper(function (a) {
    return testWrapper(function (b) {
        return a + b;
    }, {
        loc: "/Users/mshustov/work/babel-plugin-source-wrapper/spec/fixtures/FunctionDeclaration/source.js:2:12:4:6"
    });
}, {
    loc: "/Users/mshustov/work/babel-plugin-source-wrapper/spec/fixtures/FunctionDeclaration/source.js:1:11:5:2"
});
