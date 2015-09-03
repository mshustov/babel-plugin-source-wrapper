"use strict";

function A() {
    return 1;
}
loc_h8tz9yd7f1zl4t3711yc(A, {
    loc: "{{path}}:1:1:1:24",
    blackbox: true
});

var b = loc_h8tz9yd7f1zl4t3711yc(function () {
    return 2;
}, {
    loc: "{{path}}:3:9:3:30",
    blackbox: true
});

var obj = loc_h8tz9yd7f1zl4t3711yc({
    one: 1,
    two: 2,
    getCtx: loc_h8tz9yd7f1zl4t3711yc(function () {
        return this;
    }, {
        loc: "/Users/mshustov/work/babel-plugin-source-wrapper/test/fixtures/actual.js:8:13:10:6",
        blackbox: true
    }),
    getOne: loc_h8tz9yd7f1zl4t3711yc(function () {
        return this.one;
    }, {
        loc: "/Users/mshustov/work/babel-plugin-source-wrapper/test/fixtures/actual.js:11:13:13:6",
        blackbox: true
    })
}, {
    loc: "{{path}}:5:11:14:2",
    blackbox: true,
    map: {
        one: "{{path}}:6:10:6:11",
        two: "{{path}}:7:10:7:11",
        getCtx: "{{path}}:8:13:10:6",
        getOne: "{{path}}:11:13:13:6"
    }
});

var res = loc_h8tz9yd7f1zl4t3711yc(loc_h8tz9yd7f1zl4t3711yc(obj.getCtx(), {
    loc: "{{path}}:16:11:16:23",
    blackbox: true
}).getOne(), {
    loc: "{{path}}:16:11:16:32",
    blackbox: true
});

loc_h8tz9yd7f1zl4t3711yc(console.log(res), {
    loc: "{{path}}:18:1:18:17",
    blackbox: true
});

var zz = obj.one;

loc_h8tz9yd7f1zl4t3711yc([1, 2, 3], {
    loc: "{{path}}:22:1:22:8",
    blackbox: true
});

loc_h8tz9yd7f1zl4t3711yc(new A(), {
    loc: "{{path}}:24:1:24:8",
    blackbox: true
});

var obj2 = loc_h8tz9yd7f1zl4t3711yc({
    method: loc_h8tz9yd7f1zl4t3711yc(function c() {
        return loc_h8tz9yd7f1zl4t3711yc(function d() {
            return 14;
        }, {
            loc: "{{path}}:27:35:27:59",
            blackbox: true
        });
    }, {
        loc: "{{path}}:27:14:27:60",
        blackbox: true
    })()
}, {
    loc: "{{path}}:26:12:28:2",
    blackbox: true,
    map: {
        method: "{{path}}:27:13:27:63"
    }
});

loc_h8tz9yd7f1zl4t3711yc(obj2.method(), {
    loc: "{{path}}:30:1:30:14",
    blackbox: true
});
