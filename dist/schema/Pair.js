function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

// Published as 'yaml/pair'
import addComment from '../addComment';
import _toJSON from '../toJSON';
import Collection from './Collection';
import Node from './Node';
import Scalar from './Scalar';

var Pair =
/*#__PURE__*/
function (_Node) {
  _inherits(Pair, _Node);

  function Pair(key) {
    var _this;

    var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, Pair);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Pair).call(this));
    _this.key = key;
    _this.value = value;
    return _this;
  }

  _createClass(Pair, [{
    key: "toJSON",
    value: function toJSON() {
      var pair = {};
      pair[this.stringKey] = _toJSON(this.value);
      return pair;
    }
  }, {
    key: "toString",
    value: function toString(ctx, onComment) {
      if (!ctx || !ctx.doc) return JSON.stringify(this);
      var key = this.key,
          value = this.value;
      var keyComment = key instanceof Node && key.comment;
      var explicitKey = !key || keyComment || key instanceof Collection;
      var _ctx = ctx,
          doc = _ctx.doc,
          indent = _ctx.indent;
      ctx = Object.assign({}, ctx, {
        implicitKey: !explicitKey,
        indent: indent + '  '
      });
      var keyStr = doc.schema.stringify(key, ctx, function () {
        keyComment = null;
      });
      if (keyComment) keyStr = addComment(keyStr, ctx.indent, keyComment);
      ctx.implicitKey = false;
      var valueStr = doc.schema.stringify(value, ctx, onComment);
      var vcb = value && value.commentBefore ? " #".concat(value.commentBefore.replace(/\n+(?!\n|$)/g, "$&".concat(ctx.indent, "#"))) : '';

      if (explicitKey) {
        return "? ".concat(keyStr, "\n").concat(indent, ":").concat(vcb ? "".concat(vcb, "\n").concat(ctx.indent) : ' ').concat(valueStr);
      } else if (value instanceof Collection) {
        return "".concat(keyStr, ":").concat(vcb, "\n").concat(ctx.indent).concat(valueStr);
      } else {
        return "".concat(keyStr, ":").concat(vcb ? "".concat(vcb, "\n").concat(ctx.indent) : ' ').concat(valueStr);
      }
    }
  }, {
    key: "commentBefore",
    get: function get() {
      return this.key && this.key.commentBefore;
    },
    set: function set(cb) {
      if (this.key == null) this.key = new Scalar(null);
      this.key.commentBefore = cb;
    }
  }, {
    key: "comment",
    get: function get() {
      return this.value && this.value.comment;
    },
    set: function set(comment) {
      if (this.value == null) this.value = new Scalar(null);
      this.value.comment = comment;
    }
  }, {
    key: "stringKey",
    get: function get() {
      var key = _toJSON(this.key);

      if (key === null) return '';
      if (_typeof(key) === 'object') try {
        return JSON.stringify(key);
      } catch (e) {
        /* should not happen, but let's ignore in any case */
      }
      return String(key);
    }
  }]);

  return Pair;
}(Node);

export { Pair as default };