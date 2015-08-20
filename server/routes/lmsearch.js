'use strict';

var fs = require('fs');
var path = require('path');
var logger = require('../utils/logger')(module);

module.exports = function () {
  var lmsearch = {};
  // Temporary
  var filePath = path.join(__dirname, '../bootstrap/lmsearch_demo1.txt');

  lmsearch.list = function (req, res) {
    try {
      var doc = fs.readFileSync(filePath, 'utf8');
      var json = JSON.parse(doc);
      res.status(200).send({data: json});
    } catch (err) {
      logger.error('Cannot read file at ' + filePath + '. Error: ', err);
      return res.status(400).send(err);
    }
  };
  return lmsearch;
};
