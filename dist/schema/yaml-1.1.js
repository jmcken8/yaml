import { YAMLReferenceError } from '../errors';
import binary from './_binary';
import timestamp from './_timestamp';
import { stringifyNumber } from './core';
import failsafe from './failsafe';
export var nullOptions = {
  nullStr: 'null'
};
export var boolOptions = {
  trueStr: 'true',
  falseStr: 'false'
};
export default failsafe.concat([{
  class: null,
  tag: 'tag:yaml.org,2002:null',
  test: /^(?:~|null)?$/i,
  resolve: function resolve() {
    return null;
  },
  options: nullOptions,
  stringify: function stringify() {
    return nullOptions.nullStr;
  }
}, {
  class: Boolean,
  tag: 'tag:yaml.org,2002:bool',
  test: /^(?:y|yes|true|on)$/i,
  resolve: function resolve() {
    return true;
  },
  options: boolOptions,
  stringify: function stringify(_ref) {
    var value = _ref.value;
    return value ? boolOptions.trueStr : boolOptions.falseStr;
  }
}, {
  class: Boolean,
  tag: 'tag:yaml.org,2002:bool',
  test: /^(?:n|no|false|off)$/i,
  resolve: function resolve() {
    return false;
  },
  options: boolOptions,
  stringify: function stringify(_ref2) {
    var value = _ref2.value;
    return value ? boolOptions.trueStr : boolOptions.falseStr;
  }
}, {
  class: Number,
  tag: 'tag:yaml.org,2002:int',
  format: 'bin',
  test: /^0b([0-1_]+)$/,
  resolve: function resolve(str, bin) {
    return parseInt(bin.replace(/_/g, ''), 2);
  },
  stringify: function stringify(_ref3) {
    var value = _ref3.value;
    return '0b' + value.toString(2);
  }
}, {
  class: Number,
  tag: 'tag:yaml.org,2002:int',
  format: 'oct',
  test: /^[-+]?0([0-7_]+)$/,
  resolve: function resolve(str, oct) {
    return parseInt(oct.replace(/_/g, ''), 8);
  },
  stringify: function stringify(_ref4) {
    var value = _ref4.value;
    return (value < 0 ? '-0' : '0') + value.toString(8);
  }
}, {
  class: Number,
  tag: 'tag:yaml.org,2002:int',
  test: /^[-+]?[0-9][0-9_]*$/,
  resolve: function resolve(str) {
    return parseInt(str.replace(/_/g, ''), 10);
  },
  stringify: stringifyNumber
}, {
  class: Number,
  tag: 'tag:yaml.org,2002:int',
  format: 'hex',
  test: /^0x([0-9a-fA-F_]+)$/,
  resolve: function resolve(str, hex) {
    return parseInt(hex.replace(/_/g, ''), 16);
  },
  stringify: function stringify(_ref5) {
    var value = _ref5.value;
    return (value < 0 ? '-0x' : '0x') + value.toString(16);
  }
}, {
  class: Number,
  tag: 'tag:yaml.org,2002:float',
  test: /^(?:[-+]?\.inf|(\.nan))$/i,
  resolve: function resolve(str, nan) {
    return nan ? NaN : str[0] === '-' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  },
  stringify: stringifyNumber
}, {
  class: Number,
  tag: 'tag:yaml.org,2002:float',
  test: /^[-+]?([0-9][0-9_]*)?\.[0-9_]*([eE][-+]?[0-9]+)?$/,
  resolve: function resolve(str) {
    return parseFloat(str.replace(/_/g, ''));
  },
  stringify: stringifyNumber
}], timestamp, binary);