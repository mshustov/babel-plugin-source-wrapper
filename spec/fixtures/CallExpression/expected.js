"use strict";

var res = (testWrapper)((testWrapper)(obj.getCtx(), {
  loc: "{{path}}:1:11:1:23"
}).getOne(), {
  loc: "{{path}}:1:11:1:32"
});

(testWrapper)(console.log(res), {
  loc: "{{path}}:3:1:3:17"
});

var a = obj.getCtx;
var b = obj["getCtx"]();

// shouldn't wrap require.ensure
require.ensure(["module-a", "module-b"], function (require) {
  var a = require("module-a");
  var b = (testWrapper)([], {
    loc: "{{path}}:11:11:11:13"
  });
});

// shouldn't wrap define
define(function (require) {
  var a = require("module-a");
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
