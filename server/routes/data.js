var fs = require('fs');
var dimsutil = require('../utils/util');
var config = require('../config');
// var yaml = require('js-yaml');
var JSONStream = require('JSONStream');
var logger = require('../utils/logger');

exports.list = function(req, res){
  logger.debug('routes/data.list start');
  path = req.query.source;
  var source = fs.createReadStream(path);
  source.pipe(dimsutil.createParser())
    .pipe(JSONStream.stringify())
    .pipe(res);

  // liner.on('readable', function() {
  //   var line;
  //   while (line = liner.read()) {
  //     console.log(line);
  //   }
  // });

};