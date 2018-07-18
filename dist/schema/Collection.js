function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import addComment from '../addComment';
import Node from './Node';
export default class Collection extends Node {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "items", []);
  }

  // overridden in implementations
  toJSON() {
    return null;
  }

  toString(ctx, {
    blockItem,
    flowChars,
    itemIndent
  }, onComment) {
    const {
      doc,
      indent,
      inFlow
    } = ctx;
    ctx = Object.assign({}, ctx, {
      indent: itemIndent,
      type: null
    });
    let hasItemWithComment = false;
    let hasItemWithNewLine = false;
    const nodes = this.items.reduce((nodes, item, i) => {
      const commentBefore = item && item.commentBefore;

      if (commentBefore) {
        hasItemWithComment = true;
        commentBefore.match(/^.*$/gm).forEach(line => {
          nodes.push({
            type: 'comment',
            str: `#${line}`
          });
        });
      }

      let comment = item && item.comment;
      if (comment) hasItemWithComment = true;
      let str = doc.schema.stringify(item, ctx, () => {
        comment = null;
      });
      if (!hasItemWithNewLine && str.indexOf('\n') !== -1) hasItemWithNewLine = true;
      if (inFlow && i < this.items.length - 1) str += ',';
      str = addComment(str, itemIndent, comment);
      nodes.push({
        type: 'item',
        str
      });
      return nodes;
    }, []);
    let str;

    if (nodes.length === 0) {
      str = flowChars.start + flowChars.end;
    } else if (inFlow) {
      const {
        start,
        end
      } = flowChars;
      const strings = nodes.map(({
        str
      }) => str);

      if (hasItemWithComment || hasItemWithNewLine || strings.reduce((sum, str) => sum + str.length + 2, 2) > Collection.maxFlowStringSingleLineLength) {
        str = `${start}\n  ${indent}${strings.join(`\n  ${indent}`)}\n${indent}${end}`;
      } else {
        str = `${start} ${strings.join(' ')} ${end}`;
      }
    } else {
      str = nodes.map(blockItem).join(`\n${indent}`);
    }

    if (this.comment) {
      if (!hasItemWithNewLine && str.indexOf('\n') === -1) str = addComment(str, indent, this.comment);else str += '\n' + this.comment.replace(/^/gm, `${indent}#`);
      if (onComment) onComment();
    }

    return str;
  }

}

_defineProperty(Collection, "maxFlowStringSingleLineLength", 60);