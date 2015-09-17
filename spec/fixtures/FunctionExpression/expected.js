"use strict";

var b = testWrapper(function () {
  return 2;
}, {
  loc: "{{path}}:1:9:1:30"
});