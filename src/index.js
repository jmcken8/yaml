import parseCST from './cst/parse'
import createNode from './createNode'
import YAMLDocument from './Document'
import { YAMLSemanticError } from './errors'

const defaultOptions = {
  keepNodeTypes: true,
  keepBlobsInJSON: true,
  tags: null,
  version: '1.2'
}

class Document extends YAMLDocument {
  constructor(options) {
    super(Object.assign({}, defaultOptions, options))
  }
}

function parseAllDocuments(src, options) {
  let index = 0;
  const sendStatus = options && options.sendParseStatus;
  const cst_list = parseCST(src, options);
  const doc_list = cst_list.map(cstDoc => {
    if(sendStatus) sendStatus(false, index, cst_list.length)
    index++;
    return new Document(options).parse(cstDoc);
  })
  if(sendStatus) sendStatus(true, cst_list.length, cst_list.length);
  return doc_list;
}

function parseDocument(src, options) {
  const cst = parseCST(src)
  const doc = new Document(options).parse(cst[0])
  if (cst.length > 1) {
    const errMsg =
      'Source contains multiple documents; please use YAML.parseAllDocuments()'
    doc.errors.unshift(new YAMLSemanticError(cst[1], errMsg))
  }
  return doc
}

function parse(src, options) {
  const doc = parseDocument(src, options)
  doc.warnings.forEach(warning => console.warn(warning))
  if (doc.errors.length > 0) throw doc.errors[0]
  return doc.toJSON()
}

function stringify(value, options) {
  const doc = new Document(options)
  doc.contents = value
  return String(doc)
}

export default {
  createNode,
  defaultOptions,
  Document,
  parse,
  parseAllDocuments,
  parseCST,
  parseDocument,
  stringify
}
