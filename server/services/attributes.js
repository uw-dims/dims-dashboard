'use strict';

var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var logger = require('../utils/logger')(module);
var config = require('../config/config');

module.exports = function (Attributes) {
  var attributeService = {};

  // Save all attributes to a file so ipgrep can access
  var attributesToFile = function attributesToFile() {
    return Attributes.getAllAttributes()
    .then(function (reply) {
      var yamlDoc = yaml.safeDump(reply, {
        flowLevel: 2
      });
      fs.writeFile(path.join(config.dashboardDataPath, 'dashboard_user_attributes.yml'), yamlDoc, function (err, reply) {
        if (err) {
          throw err;
        }
      });
    })
    .catch(function (err) {
      throw err;
    });
  };

  attributeService.attributesToFile = attributesToFile;

  return attributeService;
};
