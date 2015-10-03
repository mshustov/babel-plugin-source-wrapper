"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _createDecoratedObject = require("babel-runtime/helpers/create-decorated-object")["default"];

var Foo = (function () {
  function Foo() {
    _classCallCheck(this, _Foo);
  }

  var _Foo = Foo;
  Foo = testWrapper.wrapDecorator(decorator, {
    loc: "{{path}}:1:1:1:11"
  })(Foo) || Foo;
  return Foo;
})();

testWrapper(Foo, {
  loc: "{{path}}:2:1:2:13"
});

var Bar = (function () {
  function Bar() {
    _classCallCheck(this, _Bar);
  }

  var _Bar = Bar;
  Bar = testWrapper.wrapDecorator(decorator(testWrapper({ a: 1 }, {
    loc: "{{path}}:4:12:4:20",
    map: {
      a: "{{path}}:4:17:4:18"
    }
  })), {
    loc: "{{path}}:4:1:4:21"
  })(Bar) || Bar;
  return Bar;
})();

testWrapper(Bar, {
  loc: "{{path}}:5:1:5:13"
});

var Baz = (function () {
  function Baz() {
    _classCallCheck(this, _Baz);
  }

  var _Baz = Baz;
  Baz = testWrapper.wrapDecorator(decorator(testWrapper(_createDecoratedObject([{
    key: "method",
    decorators: [testWrapper.wrapDecorator(decorator, {
      loc: "{{path}}:8:3:8:13"
    })],
    value: testWrapper(function () {}, {
      loc: "{{path}}:9:9:9:14"
    })
  }]), {
    loc: "{{path}}:7:12:10:2",
    map: {
      method: "{{path}}:9:9:9:14"
    }
  })), {
    loc: "{{path}}:7:1:10:3"
  })(Baz) || Baz;
  return Baz;
})();

testWrapper(Baz, {
  loc: "{{path}}:11:1:11:13"
});
