function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { YAMLSyntaxError } from '../errors';
import Alias from './Alias';
import BlockValue from './BlockValue';
import Collection from './Collection';
import CollectionItem from './CollectionItem';
import FlowCollection from './FlowCollection';
import Node, { Char, Type } from './Node';
import PlainValue from './PlainValue';
import QuoteDouble from './QuoteDouble';
import QuoteSingle from './QuoteSingle';
import Range from './Range';
/**
 * @param {boolean} atLineStart - Node starts at beginning of line
 * @param {boolean} inFlow - true if currently in a flow context
 * @param {boolean} inCollection - true if currently in a collection context
 * @param {number} indent - Current level of indentation
 * @param {number} lineStart - Start of the current line
 * @param {Node} parent - The parent of the node
 * @param {string} src - Source of the YAML document
 */

var ParseContext =
/*#__PURE__*/
function () {
  _createClass(ParseContext, null, [{
    key: "parseType",
    value: function parseType(src, offset, inFlow) {
      switch (src[offset]) {
        case '*':
          return Type.ALIAS;

        case '>':
          return Type.BLOCK_FOLDED;

        case '|':
          return Type.BLOCK_LITERAL;

        case '{':
          return Type.FLOW_MAP;

        case '[':
          return Type.FLOW_SEQ;

        case '?':
          return !inFlow && Node.atBlank(src, offset + 1) ? Type.MAP_KEY : Type.PLAIN;

        case ':':
          return !inFlow && Node.atBlank(src, offset + 1) ? Type.MAP_VALUE : Type.PLAIN;

        case '-':
          return !inFlow && Node.atBlank(src, offset + 1) ? Type.SEQ_ITEM : Type.PLAIN;

        case '"':
          return Type.QUOTE_DOUBLE;

        case "'":
          return Type.QUOTE_SINGLE;

        default:
          return Type.PLAIN;
      }
    }
  }]);

  function ParseContext() {
    var _this = this;

    var orig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        atLineStart = _ref.atLineStart,
        inCollection = _ref.inCollection,
        inFlow = _ref.inFlow,
        indent = _ref.indent,
        lineStart = _ref.lineStart,
        parent = _ref.parent;

    _classCallCheck(this, ParseContext);

    _defineProperty(this, "parseNode", function (overlay, start) {
      if (Node.atDocumentBoundary(_this.src, start)) return null;
      var context = new ParseContext(_this, overlay);

      var _context$parseProps = context.parseProps(start),
          props = _context$parseProps.props,
          type = _context$parseProps.type,
          valueStart = _context$parseProps.valueStart;

      var node;

      switch (type) {
        case Type.ALIAS:
          node = new Alias(type, props);
          break;

        case Type.BLOCK_FOLDED:
        case Type.BLOCK_LITERAL:
          node = new BlockValue(type, props);
          break;

        case Type.FLOW_MAP:
        case Type.FLOW_SEQ:
          node = new FlowCollection(type, props);
          break;

        case Type.MAP_KEY:
        case Type.MAP_VALUE:
        case Type.SEQ_ITEM:
          node = new CollectionItem(type, props);
          break;

        case Type.COMMENT:
        case Type.PLAIN:
          node = new PlainValue(type, props);
          break;

        case Type.QUOTE_DOUBLE:
          node = new QuoteDouble(type, props);
          break;

        case Type.QUOTE_SINGLE:
          node = new QuoteSingle(type, props);
          break;

        default:
          node.error = new YAMLSyntaxError(node, "Unknown node type: ".concat(JSON.stringify(type)));
          node.range = new Range(start, start + 1);
          return node;
      }

      var offset = node.parse(context, valueStart);
      var nodeEnd = _this.src[offset] === '\n' ? offset + 1 : offset;

      if (nodeEnd <= start) {
        node.error = new Error("Node#parse consumed no characters");
        node.error.parseEnd = nodeEnd;
        node.error.source = node;
        nodeEnd = start + 1;
      }

      node.range = new Range(start, nodeEnd);

      if (context.nodeStartsCollection(node)) {
        if (!node.error && !context.atLineStart && context.parent.type === Type.DOCUMENT) {
          node.error = new YAMLSyntaxError(node, 'Block collection must not have preceding content here (e.g. directives-end indicator)');
        }

        var collection = new Collection(node);
        offset = collection.parse(new ParseContext(context), offset);
        collection.range = new Range(start, offset);
        return collection;
      }

      return node;
    });

    this.atLineStart = atLineStart != null ? atLineStart : orig.atLineStart || false;
    this.inCollection = inCollection != null ? inCollection : orig.inCollection || false;
    this.inFlow = inFlow != null ? inFlow : orig.inFlow || false;
    this.indent = indent != null ? indent : orig.indent;
    this.lineStart = lineStart != null ? lineStart : orig.lineStart;
    this.parent = parent != null ? parent : orig.parent || {};
    this.src = orig.src;
  } // for logging


  _createClass(ParseContext, [{
    key: "nodeStartsCollection",
    value: function nodeStartsCollection(node) {
      var inCollection = this.inCollection,
          inFlow = this.inFlow,
          src = this.src;
      if (inCollection || inFlow) return false;
      if (node instanceof CollectionItem) return true; // check for implicit key

      var offset = node.range.end;
      if (src[offset] === '\n' || src[offset - 1] === '\n') return false;
      offset = Node.endOfWhiteSpace(src, offset);
      return src[offset] === ':';
    } // Anchor and tag are before type, which determines the node implementation
    // class; hence this intermediate step.

  }, {
    key: "parseProps",
    value: function parseProps(offset) {
      var inFlow = this.inFlow,
          parent = this.parent,
          src = this.src;
      var props = [];
      var lineHasProps = false;
      offset = Node.endOfWhiteSpace(src, offset);
      var ch = src[offset];

      while (ch === Char.ANCHOR || ch === Char.COMMENT || ch === Char.TAG || ch === '\n') {
        if (ch === '\n') {
          var lineStart = offset + 1;
          var inEnd = Node.endOfIndent(src, lineStart);
          var indentDiff = inEnd - (lineStart + this.indent);
          var noIndicatorAsIndent = parent.type === Type.SEQ_ITEM && parent.context.atLineStart;
          if (!Node.nextNodeIsIndented(src[inEnd], indentDiff, !noIndicatorAsIndent)) break;
          this.atLineStart = true;
          this.lineStart = lineStart;
          lineHasProps = false;
          offset = inEnd;
        } else if (ch === Char.COMMENT) {
          var end = Node.endOfLine(src, offset + 1);
          props.push(new Range(offset, end));
          offset = end;
        } else {
          var _end = Node.endOfIdentifier(src, offset + 1);

          props.push(new Range(offset, _end));
          lineHasProps = true;
          offset = Node.endOfWhiteSpace(src, _end);
        }

        ch = src[offset];
      } // '- &a : b' has an anchor on an empty node


      if (lineHasProps && ch === ':' && Node.atBlank(src, offset + 1)) offset -= 1;
      var type = ParseContext.parseType(src, offset, inFlow);
      return {
        props: props,
        type: type,
        valueStart: offset
      };
    }
    /**
     * Parses a node from the source
     * @param {ParseContext} overlay
     * @param {number} start - Index of first non-whitespace character for the node
     * @returns {?Node} - null if at a document boundary
     */

  }, {
    key: "pretty",
    get: function get() {
      var obj = {
        start: "".concat(this.lineStart, " + ").concat(this.indent),
        in: [],
        parent: this.parent.type
      };
      if (!this.atLineStart) obj.start += ' + N';
      if (this.inCollection) obj.in.push('collection');
      if (this.inFlow) obj.in.push('flow');
      return obj;
    }
  }]);

  return ParseContext;
}();

export { ParseContext as default };