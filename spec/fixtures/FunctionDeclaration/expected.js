"use strict";

function A() {
  return 1;
}
testWrapper(A, {
  loc: "{{path}}:1:1:1:24"
});