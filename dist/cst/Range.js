"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class Range {
  static copy(orig) {
    return new Range(orig.start, orig.end);
  }

  constructor(start, end) {
    this.start = start;
    this.end = end || start;
  }

  get isEmpty() {
    return typeof this.start !== 'number' || !this.end || this.end <= this.start;
  }

  get length() {
    return this.isEmpty ? 0 : this.end - this.start;
  }

  apply(src) {
    return this.isEmpty ? '' : src.slice(this.start, this.end);
  }

}

exports.default = Range;