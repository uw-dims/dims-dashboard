var fs = require('fs');
var util = require('../utils/util');
var config = require('../config');
var yaml = require('js-yaml');
var JSONStream = require('JSONStream');

exports.list = function(req, res){
  console.log ('in data.list');
  path = req.query.source;
  var source = fs.createReadStream(path);
  source.pipe(util.createParser())
    .pipe(JSONStream.stringify())
    .pipe(res);

  // liner.on('readable', function() {
  //   var line;
  //   while (line = liner.read()) {
  //     console.log(line);
  //   }
  // });

};