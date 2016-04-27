"use strict";

var res = (testWrapper)((testWrapper)(obj.getCtx(), {
  loc: "{{path}}:1:15:1:23"
}).getOne(), {
  loc: "{{path}}:1:24:1:32"
});

(testWrapper)(console.log(res), {
  loc: "{{path}}:3:9:3:17"
});

var a = obj.getCtx;
var b = (testWrapper)(obj["getCtx"](), {
  loc: "{{path}}:6:9:6:24"
});

// shouldn't wrap require.ensure
require.ensure(["module-a", "module-b"], function (require) {
  var a = (testWrapper)(require("module-a"), {
    loc: "{{path}}:10:11:10:30"
  });
  var b = (testWrapper)([], {
    loc: "{{path}}:11:11:11:13"
  });
});

// shouldn't wrap define
define(function (require) {
  var a = (testWrapper)(require("module-a"), {
    loc: "{{path}}:16:11:16:30"
  });
  var b = (testWrapper)([], {
    loc: "{{path}}:17:11:17:13"
  });
});

define(["module-a", "module-b"], function (a, b) {
  var c = (testWrapper)([], {
    loc: "{{path}}:21:11:21:13"
  });
  require.ensure([], function () {
    var d = (testWrapper)([], {
      loc: "{{path}}:23:13:23:15"
    });
  });
});

require.ensure([], function () {
  (testWrapper)(require('./ensure'), {
    loc: "{{path}}:28:5:28:24"
  });
  var b = (testWrapper)([], {
    loc: "{{path}}:29:13:29:15"
  });
}, 'test');
