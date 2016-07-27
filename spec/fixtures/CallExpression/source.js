var res = obj.getCtx().getOne();

console.log(res);

var a = obj.getCtx;
var b = obj["getCtx"]();

// shouldn't wrap require.ensure
require.ensure(["module-a", "module-b"], function(require) {
  var a = require("module-a");
  var b = [];
});

// shouldn't wrap define
define(function(require) {
  var a = require("module-a");
  var b = [];
});

define(["module-a", "module-b"], function(a, b) {
  var c = [];
  require.ensure([], function() {
    var d = [];
  });
});

require.ensure([], () => {
    require('./ensure');
    var b = [];
}, 'test');
