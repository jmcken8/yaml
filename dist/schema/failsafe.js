import Map from './Map';
import Seq from './Seq';
import { str } from './_string';
import parseMap from './parseMap';
import parseSeq from './parseSeq';
export var map = {
  class: Map,
  tag: 'tag:yaml.org,2002:map',
  resolve: parseMap,
  stringify: function stringify(value, ctx, onComment) {
    return value.toString(ctx, onComment);
  }
};
export var seq = {
  class: Seq,
  tag: 'tag:yaml.org,2002:seq',
  resolve: parseSeq,
  stringify: function stringify(value, ctx, onComment) {
    return value.toString(ctx, onComment);
  }
};
export default [map, seq, str];