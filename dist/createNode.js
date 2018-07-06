function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

import Map from './schema/Map';
import Pair from './schema/Pair';
import Scalar from './schema/Scalar';
import Seq from './schema/Seq';
export default function createNode(value) {
  var wrapScalars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  if (value == null) return new Scalar(null);
  if (_typeof(value) !== 'object') return wrapScalars ? new Scalar(value) : value;

  if (Array.isArray(value)) {
    var seq = new Seq();
    seq.items = value.map(function (v) {
      return createNode(v, wrapScalars);
    });
    return seq;
  } else {
    var map = new Map();
    map.items = Object.keys(value).map(function (key) {
      var k = createNode(key, wrapScalars);
      var v = createNode(value[key], wrapScalars);
      return new Pair(k, v);
    });
    return map;
  }
}