"use strict";

var res = testWrapper(testWrapper(obj.getCtx(), {
  loc: "{{path}}:1:11:1:23"
}).getOne(), {
  loc: "{{path}}:1:11:1:32"
});

testWrapper(console.log(res), {
  loc: "{{path}}:3:1:3:17"
});

var a = obj.getCtx;
var b = obj["getCtx"]();

// shouldn't wrap require.ensure
require.ensure(["module-a", "module-b"], function (require) {
  var a = require("module-a");
});

// shouldn't wrap define
define(function (require) {
  require("module-a");
});

define(["module-a", "module-b"], function (a, b) {
  // ...
});
