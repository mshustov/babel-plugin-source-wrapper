"use strict";

var obj = testWrapper({
    one: 1,
    two: 2,
    getCtx: testWrapper(function () {
        return this;
    }, {
        loc: "{{path}}:4:13:6:6"
    }),
    getOne: testWrapper(function () {
        return this.one;
    }, {
        loc: "{{path}}:7:13:9:6"
    })
}, {
    loc: "{{path}}:1:11:10:2",
    map: {
        one: "{{path}}:2:10:2:11",
        two: "{{path}}:3:10:3:11",
        getCtx: "{{path}}:4:13:6:6",
        getOne: "{{path}}:7:13:9:6"
    }
});