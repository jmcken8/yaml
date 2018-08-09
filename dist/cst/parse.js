"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parse;

var _Document = _interopRequireDefault(require("./Document"));

var _ParseContext = _interopRequireDefault(require("./ParseContext"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Published as 'yaml/parse-cst'
async function parse(src, options) {
  if (src.indexOf('\r') !== -1) src = src.replace(/\r\n?/g, '\n');
  const context = new _ParseContext.default({
    src
  });
  const documents = [];
  const sendStatus = options && options.sendCSTStatus;
  let offset = 0;

  while (offset < src.length) {
    const doc = new _Document.default();
    const calc_offset = new Promise(resolve => {
      setTimeout(() => {
        resolve(doc.parse(context, offset));
      });
    });
    offset = await calc_offset;
    documents.push(doc);
    if (sendStatus) sendStatus(false, offset, src.length);
  }

  if (sendStatus) sendStatus(true, src.length, src.length);

  documents.toString = () => documents.join('...\n');

  return documents;
}