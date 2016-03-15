/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
'use strict';

var stream = require('stream');
var logger = require('./logger')(module);

var createParser = function () {

  var parser = new stream.Transform({ objectMode: true });

  var getObject = function (line) {
    var values = [],
        split = line.split(' '),
        date = new Date(split[0]);
    values[0] = date.getTime();
    values[1] = parseInt(split[1]);
    return values;
  };

  parser._transform = function (chunk, encoding, done) {
    var data = chunk.toString();
    if (this._lastLineData) {
      data = this._lastLineData + data;
    }
    var lines = data.split('\n');
    this._lastLineData = lines.splice(lines.length - 1, 1)[0];
    lines.forEach(function (line) {
      this.push(getObject(line));
    }, this);
    done();
  };

  parser._flush = function (done) {
    if (this._lastLineData) {
      this.push(getObject(this._lastLineData));
    }
    this._lastLineData = null;
    done();
  };

  return parser;
};

exports.createParser = createParser;


var processPython = function (python, req, res) {
  var output = '';
  logger.debug('util:processPython spawned child PID: %d', python.pid);
  python.stdout.on('data', function (data) {
    output += data;
  });

  python.stderr.on('data', function (data) {
    var decoder = new (require('string_decoder').StringDecoder)('utf-8');
    logger.info('util:processPython stderr %s', decoder.write(data));
  });

  python.on('close', function (code) {
    logger.debug('processPython closed. PID: ' + python.pid + ', code: ' + code);
    if (code !== 0) {
      logger.error('processPython closed with error. PID: %d, code: %s', python.pid, code);
      return res.status(500).json({code: code, pid: python.pid, data: output});
    }
    try {
      console.log(output);
      var jsonOutput = JSON.parse(output);
      return res.status(200).json({pid: python.pid, data: jsonOutput});
    } catch (e) {
      return res.status(200).json({pid: python.pid, data: output});
    }
  });
};

exports.processPython = processPython;

// Create a timestamp, UTC, milliseconds from epoch
var createTimestamp = function () {
  var now = new Date().getTime();
  return now;
};

exports.createTimestamp = createTimestamp;


