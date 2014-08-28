var stream = require('stream');
var async = require('async');
var _ = require('lodash');
var logger = require('./logger');

var createParser = function() {

  var parser = new stream.Transform( { objectMode: true });
  var keys = ['date', 'bytes'];

  var getObject = function(line) {
    var values = [],
        split = line.split(' '),
        date = new Date(split[0]);
    values[0] = date.getTime();
    values[1] = parseInt(split[1]);
    return values;
  };

  parser._transform = function(chunk, encoding, done) {
    var data = chunk.toString();
    if (this._lastLineData) {
      data = this._lastLineData + data;
    }
    var lines = data.split('\n');
    this._lastLineData = lines.splice(lines.length-1,1)[0];

    // async.eachSeries(lines, function(line, callback) {
    //   var values = [];
    //   var split = line.split(' ');
    //   values[0] = split[0];
    //   values[1] = split[1];
    // })
    lines.forEach(function(line) {
      // this.push(_.object(keys, getObject(line)))
      this.push(getObject(line));
    }, this);
    // lines.forEach(this.push.bind(this));
    done();
  };

  parser._flush = function(done) {
    if (this._lastLineData) {
      // this.push(_.object(keys, getObject(this._lastLineData)));
      this.push(getObject(this._lastLineData))
    }
    this._lastLineData = null;
    done();
  };

  return parser;
};

exports.createParser = createParser;


var processPython = function(python, req, res) {
  var output = '';
  logger.debug('processPython spawned child pid: %d', python.pid);
  python.stdout.on('data', function(data) {
    logger.debug('processPython receiving data on pid: %d', python.pid);
    output += data;
  });

  python.stderr.on('data', function(data) {
    var decoder = new (require('string_decoder').StringDecoder)('utf-8');
    logger.error('processPython stderr %s', decoder.write(data));
  });

  python.on('close', function(code) {
    logger.debug('processPython closed. PID: %d', python.pid);
    if (code !== 0) {
      logger.error('processPython closed with error. ', {code: code, pid: python.pid});
      return res.status(500).json({code: code, pid: python.pid, data: output});
    }
    return res.send(200, output);
  })
};

exports.processPython = processPython;

