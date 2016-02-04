'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Bar2 = function (_Bar) {
  _inherits(Bar2, _Bar);

  function Bar2() {
    _classCallCheck(this, Bar2);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Bar2).apply(this, arguments));
  }

  _createClass(Bar2, [{
    key: 'render',
    value: (testWrapper)(function render() {
      return 'hello';
    }, {
      loc: '{{path}}:2:11:4:4'
    })
  }]);

  return Bar2;
}(Bar);

(testWrapper)(Bar2, {
  loc: '{{path}}:1:1:5:2',
  type: 'class'
});

var Bar = (testWrapper)({
  render: (testWrapper)(function render() {
    return 'hello';
  }, {
    loc: '{{path}}:8:11:10:4'
  })
}, {
  loc: '{{path}}:7:12:11:2',
  map: {}
});

var z = (testWrapper)(function () {
  return 1;
}, {
  loc: '{{path}}:13:9:13:25'
});
