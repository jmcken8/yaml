// Published as 'yaml/parse-cst'

import Document from './Document'
import ParseContext from './ParseContext'

export default function parse(src, options) {
  if (src.indexOf('\r') !== -1) src = src.replace(/\r\n?/g, '\n')
  const context = new ParseContext({ src })
  const documents = []
  const sendStatus = options && options.sendCSTStatus;
  let offset = 0
  while (offset < src.length) {
    const doc = new Document()
    offset = doc.parse(context, offset)
    documents.push(doc)
    if(sendStatus) sendStatus(false, offset, src.length)
  }
  if(sendStatus) sendStatus(true, src.length, src.length)
  documents.toString = () => documents.join('...\n')
  return documents
}
