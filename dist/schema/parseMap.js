import { Type } from '../cst/Node';
import { YAMLSemanticError, YAMLSyntaxError } from '../errors';
import Map from './Map';
import Merge, { MERGE_KEY } from './Merge';
import Pair from './Pair';
import { checkKeyLength, resolveComments } from './parseUtils';
import Alias from './Alias';
export default function parseMap(doc, cst) {
  var _ref = cst.type === Type.FLOW_MAP ? resolveFlowMapItems(doc, cst) : resolveBlockMapItems(doc, cst),
      comments = _ref.comments,
      items = _ref.items;

  var map = new Map();
  map.items = items;
  resolveComments(map, comments);

  for (var i = 0; i < items.length; ++i) {
    var iKey = items[i].key;

    for (var j = i + 1; j < items.length; ++j) {
      var jKey = items[j].key;

      if (iKey === jKey || iKey && jKey && iKey.hasOwnProperty('value') && iKey.value === jKey.value) {
        doc.errors.push(new YAMLSemanticError(cst, "Map keys must be unique; \"".concat(iKey, "\" is repeated")));
        break;
      }
    }

    if (doc.schema.merge && iKey.value === MERGE_KEY) {
      items[i] = new Merge(items[i]);
      var sources = items[i].value.items;
      var error = null;
      sources.some(function (node) {
        if (node instanceof Alias) {
          // During parsing, alias sources are CST nodes; to account for
          // circular references their resolved values can't be used here.
          var type = node.source.type;
          if (type === Type.MAP || type === Type.FLOW_MAP) return false;
          return error = 'Merge nodes aliases can only point to maps';
        }

        return error = 'Merge nodes can only have Alias nodes as values';
      });
      if (error) doc.errors.push(new YAMLSemanticError(cst, error));
    }
  }

  cst.resolved = map;
  return map;
}

function resolveBlockMapItems(doc, cst) {
  var comments = [];
  var items = [];
  var key = undefined;
  var keyStart = null;

  for (var i = 0; i < cst.items.length; ++i) {
    var item = cst.items[i];

    switch (item.type) {
      case Type.COMMENT:
        comments.push({
          comment: item.comment,
          before: items.length
        });
        break;

      case Type.MAP_KEY:
        if (key !== undefined) items.push(new Pair(key));
        if (item.error) doc.errors.push(item.error);
        key = doc.resolveNode(item.node);
        keyStart = null;
        break;

      case Type.MAP_VALUE:
        if (key === undefined) key = null;
        if (item.error) doc.errors.push(item.error);

        if (!item.context.atLineStart && item.node && item.node.type === Type.MAP && !item.node.context.atLineStart) {
          doc.errors.push(new YAMLSemanticError(item.node, 'Nested mappings are not allowed in compact mappings'));
        }

        items.push(new Pair(key, doc.resolveNode(item.node)));
        checkKeyLength(doc.errors, cst, i, key, keyStart);
        key = undefined;
        keyStart = null;
        break;

      default:
        if (key !== undefined) items.push(new Pair(key));
        key = doc.resolveNode(item);
        keyStart = item.range.start;
        if (item.error) doc.errors.push(item.error);
        var nextItem = cst.items[i + 1];
        if (!nextItem || nextItem.type !== Type.MAP_VALUE) doc.errors.push(new YAMLSemanticError(item, 'Implicit map keys need to be followed by map values'));
        if (item.valueRangeContainsNewline) doc.errors.push(new YAMLSemanticError(item, 'Implicit map keys need to be on a single line'));
    }
  }

  if (key !== undefined) items.push(new Pair(key));
  return {
    comments: comments,
    items: items
  };
}

function resolveFlowMapItems(doc, cst) {
  var comments = [];
  var items = [];
  var key = undefined;
  var keyStart = null;
  var explicitKey = false;
  var next = '{';

  for (var i = 0; i < cst.items.length; ++i) {
    checkKeyLength(doc.errors, cst, i, key, keyStart);
    var item = cst.items[i];

    if (typeof item === 'string') {
      if (item === '?' && key === undefined && !explicitKey) {
        explicitKey = true;
        next = ':';
        continue;
      }

      if (item === ':') {
        if (key === undefined) key = null;

        if (next === ':') {
          next = ',';
          continue;
        }
      } else {
        if (explicitKey) {
          if (key === undefined && item !== ',') key = null;
          explicitKey = false;
        }

        if (key !== undefined) {
          items.push(new Pair(key));
          key = undefined;
          keyStart = null;

          if (item === ',') {
            next = ':';
            continue;
          }
        }
      }

      if (item === '}') {
        if (i === cst.items.length - 1) continue;
      } else if (item === next) {
        next = ':';
        continue;
      }

      doc.errors.push(new YAMLSyntaxError(cst, "Flow map contains an unexpected ".concat(item)));
    } else if (item.type === Type.COMMENT) {
      comments.push({
        comment: item.comment,
        before: items.length
      });
    } else if (key === undefined) {
      if (next === ',') doc.errors.push(new YAMLSemanticError(item, 'Separator , missing in flow map'));
      key = doc.resolveNode(item);
      keyStart = explicitKey ? null : item.range.start; // TODO: add error for non-explicit multiline plain key
    } else {
      if (next !== ',') doc.errors.push(new YAMLSemanticError(item, 'Indicator : missing in flow map entry'));
      items.push(new Pair(key, doc.resolveNode(item)));
      key = undefined;
      explicitKey = false;
    }
  }

  if (cst.items[cst.items.length - 1] !== '}') doc.errors.push(new YAMLSemanticError(cst, 'Expected flow map to end with }'));
  if (key !== undefined) items.push(new Pair(key));
  return {
    comments: comments,
    items: items
  };
}