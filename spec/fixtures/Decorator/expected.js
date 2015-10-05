"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _createDecoratedClass = require("babel-runtime/helpers/create-decorated-class")["default"];

var _createDecoratedObject = require("babel-runtime/helpers/create-decorated-object")["default"];

var Foo = (function () {
  function Foo() {
    _classCallCheck(this, _Foo);
  }

  var _Foo = Foo;
  Foo = testWrapper.wrapDecorator(decorator, {
    loc: "{{path}}:1:1:1:11",
    type: "decorator",
    name: "decorator",
    target: null
  }, {
    loc: "{{path}}:2:1:2:13"
  })(Foo) || Foo;
  return Foo;
})();

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
    loc: "{{path}}:4:1:4:21",
    type: "decorator",
    name: "decorator(…)",
    target: null
  }, {
    loc: "{{path}}:5:1:5:13"
  })(Bar) || Bar;
  return Bar;
})();

var Baz = (function () {
  function Baz() {
    _classCallCheck(this, _Baz);
  }

  _createDecoratedClass(Baz, [{
    key: "method",
    decorators: [decorator],
    value: testWrapper(function () {}, {
      loc: "{{path}}:13:9:13:14"
    })
  }]);

  var _Baz = Baz;
  Baz = testWrapper.wrapDecorator(decorator(testWrapper(_createDecoratedObject([{
    key: "method",
    decorators: [decorator],
    value: testWrapper(function () {}, {
      loc: "{{path}}:9:9:9:14"
    })
  }]), {
    loc: "{{path}}:7:12:10:2",
    map: {
      method: "{{path}}:9:9:9:14"
    }
  })), {
    loc: "{{path}}:7:1:10:3",
    type: "decorator",
    name: "decorator(…)",
    target: null
  }, {
    loc: "{{path}}:11:1:14:2"
  })(Baz) || Baz;
  return Baz;
})();

var Qux = (function () {
  function Qux() {
    _classCallCheck(this, _Qux);
  }

  var _Qux = Qux;
  Qux = testWrapper.wrapDecorator(decorator, {
    loc: "{{path}}:17:1:17:11",
    type: "decorator",
    name: "decorator",
    target: null
  }, {
    loc: "{{path}}:18:1:18:13"
  })(Qux) || Qux;
  Qux = testWrapper.wrapDecorator(decorator, {
    loc: "{{path}}:16:1:16:11",
    type: "decorator",
    name: "decorator",
    target: null
  })(Qux) || Qux;
  return Qux;
})();
