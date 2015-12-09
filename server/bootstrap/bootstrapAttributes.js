'use strict';

// File: server/bootstrap/bootstrapAttributes.js

// Bootstrap attributes for test users

var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var _ = require('lodash-compat');
var q = require('q');

var ROOT_DIR = __dirname + '/../';
var diContainer = require(path.join(ROOT_DIR, '/services/diContainer'))();
var bluebird = require('bluebird');
var redis = require('redis');

var client = bluebird.promisifyAll(redis.createClient());
bluebird.promisifyAll(client.multi());

diContainer.factory('Attributes', require(path.join(ROOT_DIR, '/models/attributes')));
diContainer.factory('attributeService', require(path.join(ROOT_DIR, '/services/attributes')));
diContainer.register('client', client);

var Attributes = diContainer.get('Attributes');
var attributeService = diContainer.get('attributeService');
console.log('ROOT_DIR is %s', ROOT_DIR);

(function () {

  var bootstrapAttributes = {};

  exports.runBootstrap = bootstrapAttributes.runBootstrap = function () {
    console.log('Running bootstrapAttributes');
    var yamlPath = path.join(__dirname, './userAttributes.yml');
    var doc;
    try {
      doc = yaml.safeLoad(fs.readFileSync(yamlPath, 'utf8'));
      // var yamlDoc = yaml.safeDump(doc, {
      //   flowLevel: 2
      // });
      // fs.writeFileSync(path.join(__dirname, './userAttributesDump.yml'), yamlDoc);
      // console.log(yamlDoc);
    } catch (err) {
      console.error('Cannot read file at ' + yamlPath + '. Error: ', err);
      return;
    }
    var attrPromises = [];
    _.forEach(doc, function (config, user) {
      var newConfig = {};
      _.forEach(config, function (value, type) {
        // We don't push the name field to this config
        if (type !== 'name') {
          newConfig[type] = value;
        }
      });
      var attributes = Attributes.attributesFactory(user);
      attrPromises.push(attributes.updateAttributes(user, newConfig));
    });
    return q.all(attrPromises)
    .then(function () {
      // print the result, save to a new file, and quit redis client
      Attributes.getAllAttributes()
      .then(function (reply) {
        console.log('bootstrapAttributes: returned from Attributes.getAllAttributes(): ', reply);
        return attributeService.attributesToFile();
      })
      .then(function () {
        return client.quitAsync();
      })
      .catch(function (err) {
        console.log(err);
      })
      .done();
    });
  };


  if (!module.parent) {
    bootstrapAttributes.runBootstrap();
  }

})();
