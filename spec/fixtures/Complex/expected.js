"use strict";

var obj2 = (testWrapper)({
    method: (testWrapper)((testWrapper)(function c() {
        return (testWrapper)(function d() {
            return 14;
        }, {
            loc: "{{path}}:2:35:2:59"
        });
    }, {
        loc: "{{path}}:2:14:2:60"
    })(), {
        loc: "{{path}}:2:13:2:63"
    })
}, {
    loc: "{{path}}:1:12:3:2",
    map: {
        method: "{{path}}:2:13:2:63"
    }
});

(testWrapper)(obj2.method(), {
    loc: "{{path}}:5:6:5:14"
});
