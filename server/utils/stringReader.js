'use strict';

var Stream = require('stream');
var util = require('util');

function StringReader(str) {
  Stream.Readable.call(this);
  this.data = str;
}

util.inherits(StringReader, Stream.Readable);

module.exports = StringReader;

StringReader.prototype._read = function () {
  this.push(this.data);
  this.push('\n');
  this.push(null);
};

