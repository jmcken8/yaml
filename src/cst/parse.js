// Published as 'yaml/parse-cst'

import Document from './Document'
import ParseContext from './ParseContext'

export default async function parse(src, options) {
  if (src.indexOf('\r') !== -1) src = src.replace(/\r\n?/g, '\n')
  const context = new ParseContext({ src })
  const documents = []
  const sendStatus = options && options.sendCSTStatus;
  let offset = 0
  while (offset < src.length) {
    const doc = new Document()
    const calc_offset = new Promise(resolve => {
        setTimeout(() => {
            resolve(doc.parse(context, offset));
        });
    });
    offset = await calc_offset;
    documents.push(doc)
    if(sendStatus) sendStatus(false, offset, src.length)
  }
  if(sendStatus) sendStatus(true, src.length, src.length)
  documents.toString = () => documents.join('...\n')
  return documents
}
