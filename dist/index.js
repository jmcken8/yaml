function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

import parseCST from './cst/parse';
import createNode from './createNode';
import _Document from './Document';
var defaultOptions = {
  tags: null,
  version: '1.2'
};

function parseDocuments(src, options) {
  return parseCST(src).map(function (astDoc) {
    return new _Document(Object.assign({}, defaultOptions, options)).parse(astDoc);
  });
}

function parse(src, options) {
  var docs = parseDocuments(src, options);
  docs.forEach(function (doc) {
    doc.warnings.forEach(function (warning) {
      return console.warn(warning);
    });
    doc.errors.forEach(function (error) {
      throw error;
    });
  });

  if (docs.length > 1) {
    throw new Error('Source contains multiple documents; please use YAML.parseDocuments()');
  }

  return docs[0] && docs[0].toJSON();
}

function stringify(value, options) {
  var doc = new _Document(Object.assign({}, defaultOptions, options));
  doc.contents = value;
  return String(doc);
}

export default {
  createNode: createNode,
  defaultOptions: defaultOptions,
  Document:
  /*#__PURE__*/
  function (_Document2) {
    _inherits(Document, _Document2);

    function Document(options) {
      _classCallCheck(this, Document);

      return _possibleConstructorReturn(this, _getPrototypeOf(Document).call(this, Object.assign({}, defaultOptions, options)));
    }

    return Document;
  }(_Document),
  parse: parse,
  parseDocuments: parseDocuments,
  stringify: stringify
};