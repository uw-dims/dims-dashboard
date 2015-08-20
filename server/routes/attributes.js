'use strict';

// Attributes route - retrieve and update all attributes via REST api
// This is just a first cut - will be expanded
// For now just read one yaml file - will save in database later
var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var logger = require('../utils/logger')(module);

module.exports = function () {
  var attributes = {};
  // Temporary
  var yamlPath = path.join(__dirname, '../bootstrap/userAttributes.yml');

  attributes.list = function (req, res) {
    try {
      var doc = yaml.safeLoad(fs.readFileSync(yamlPath, 'utf8'));
      res.status(200).send({data: doc});
    } catch (err) {
      logger.error('Cannot read file at ' + yamlPath + '. Error: ', err);
      return res.status(400).send(err);
    }
  };
  return attributes;
};
