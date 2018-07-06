// Published as 'yaml/parse-cst'
import Document from './Document';
import ParseContext from './ParseContext';
export default function parse(src) {
  if (src.indexOf('\r') !== -1) src = src.replace(/\r\n?/g, '\n');
  var context = new ParseContext({
    src: src
  });
  var documents = [];
  var offset = 0;

  while (offset < src.length) {
    var doc = new Document();
    offset = doc.parse(context, offset);
    documents.push(doc);
  }

  documents.toString = function () {
    return documents.join('...\n');
  };

  return documents;
}