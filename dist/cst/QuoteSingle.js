function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

import { YAMLSemanticError, YAMLSyntaxError } from '../errors';
import Node from './Node';
import Range from './Range';

var QuoteSingle =
/*#__PURE__*/
function (_Node) {
  _inherits(QuoteSingle, _Node);

  function QuoteSingle() {
    _classCallCheck(this, QuoteSingle);

    return _possibleConstructorReturn(this, _getPrototypeOf(QuoteSingle).apply(this, arguments));
  }

  _createClass(QuoteSingle, [{
    key: "parse",

    /**
     * Parses a 'single quoted' value from the source
     *
     * @param {ParseContext} context
     * @param {number} start - Index of first character
     * @returns {number} - Index of the character after this scalar
     */
    value: function parse(context, start) {
      this.context = context;
      var src = context.src;
      var offset = QuoteSingle.endOfQuote(src, start + 1);
      this.valueRange = new Range(start, offset);
      offset = Node.endOfWhiteSpace(src, offset);
      offset = this.parseComment(offset);
      return offset;
    }
  }, {
    key: "strValue",

    /**
     * @returns {string | { str: string, errors: YAMLSyntaxError[] }}
     */
    get: function get() {
      if (!this.valueRange || !this.context) return null;
      var errors = [];
      var _this$valueRange = this.valueRange,
          start = _this$valueRange.start,
          end = _this$valueRange.end;
      var _this$context = this.context,
          indent = _this$context.indent,
          src = _this$context.src;
      if (src[end - 1] !== "'") errors.push(new YAMLSyntaxError(this, "Missing closing 'quote"));
      var str = '';

      for (var i = start + 1; i < end - 1; ++i) {
        var ch = src[i];

        if (ch === '\n') {
          if (Node.atDocumentBoundary(src, i + 1)) errors.push(new YAMLSemanticError(this, 'Document boundary indicators are not allowed within string values'));

          var _Node$foldNewline = Node.foldNewline(src, i, indent),
              fold = _Node$foldNewline.fold,
              offset = _Node$foldNewline.offset,
              error = _Node$foldNewline.error;

          str += fold;
          i = offset;
          if (error) errors.push(new YAMLSemanticError(this, 'Multi-line single-quoted string needs to be sufficiently indented'));
        } else if (ch === "'") {
          str += ch;
          i += 1;
          if (src[i] !== "'") errors.push(new YAMLSyntaxError(this, 'Unescaped single quote? This should not happen.'));
        } else if (ch === ' ' || ch === '\t') {
          // trim trailing whitespace
          var wsStart = i;
          var next = src[i + 1];

          while (next === ' ' || next === '\t') {
            i += 1;
            next = src[i + 1];
          }

          if (next !== '\n') str += i > wsStart ? src.slice(wsStart, i + 1) : ch;
        } else {
          str += ch;
        }
      }

      return errors.length > 0 ? {
        errors: errors,
        str: str
      } : str;
    }
  }], [{
    key: "endOfQuote",
    value: function endOfQuote(src, offset) {
      var ch = src[offset];

      while (ch) {
        if (ch === "'") {
          if (src[offset + 1] !== "'") break;
          ch = src[offset += 2];
        } else {
          ch = src[offset += 1];
        }
      }

      return offset + 1;
    }
  }]);

  return QuoteSingle;
}(Node);

export { QuoteSingle as default };