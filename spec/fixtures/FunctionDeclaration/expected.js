"use strict";

var sum = testWrapper(function (a) {
    return testWrapper(function (b) {
        return a + b;
    }, {
        loc: "{{path}}:2:12:4:6"
    });
}, {
    loc: "{{path}}:1:11:5:2"
});