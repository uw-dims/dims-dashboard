'use strict';

// Attributes route - retrieve and update all attributes via REST api
// This is just a first cut - will be expanded
// For now just read one yaml file - will save in database later
// var yaml = require('js-yaml');
// var fs = require('fs');
// var path = require('path');
var logger = require('../utils/logger')(module);
var validator = require('validator');
var config = require('../config/config');
var _ = require('lodash-compat');
var resUtils = require('../utils/responseUtils');

module.exports = function (Attributes) {
  var attributes = {};
  // Temporary
  // var yamlPath = path.join(__dirname, '../bootstrap/userAttributes.yml');

  // return attributes for all users
  attributes.list = function (req, res) {
    Attributes.getAllAttributes()
    .then(function (reply) {
      res.status(200).send(resUtils.getSuccessReply(reply));
    })
    .catch(function (err) {
      res.status(400).send(resUtils.getErrorReply(err));
    })
    .done();
  };

  // return attributes for a user
  attributes.show = function (req, res) {
    // Old way we read data from a file
    // try {
    //   var doc = yaml.safeLoad(fs.readFileSync(yamlPath, 'utf8'));
    //   res.status(200).send({data: doc});
    // } catch (err) {
    //   logger.error('Cannot read file at ' + yamlPath + '. Error: ', err);
    //   return res.status(400).send(err);
    // }
    // Now using redis
    var user = getUser(req);
    if (user === -1) {
      res.status(400).send(resUtils.getFailReply({
        message: 'Invalid characters in username'
      }));
    }
    var attributesFactory = Attributes.attributesFactory(user);
    attributesFactory.getAttributes(user)
    .then(function (reply) {
      res.status(200).send(resUtils.getSuccessReply(reply));
    })
    .catch(function (err) {
      res.status(400).send(resUtils.getErrorReply(err));
    })
    .done();

  };

  attributes.update = function (req, res) {
    var user = getUser(req);
    var reqConfig = getConfig(req);
    console.log(req.params.id);
    console.log(req.body);
    if (user === -1) {
      res.status(400).send(resUtils.getFailReply({
        message: 'Invalid characters in username'
      }));
    } else if (reqConfig === -1) {
      res.status(400).send(resUtils.getFailReply({
        message: 'Attribute type supplied was invalid'
      }));
    } else {
      var attributesFactory = Attributes.attributesFactory(user);
      attributesFactory.updateAttributes(user, reqConfig)
      .then(function (reply) {
        logger.debug('update reply ', reply);
        res.status(200).send(resUtils.getSuccessReply(null));
      })
      .catch(function (err) {
        res.status(400).send(resUtils.getErrorReply(err));
      })
      .done();
    }
  };

  // Will add validation/sanitization
  // Todo: Add returning messages to the validation
  function getConfig(req) {
    var valid = true;
    if (!req.body) {
      return -1;
    }
    _.forEach(req.body, function (value, key) {
      console.log(key);
      if (!_.includes(config.defaultAttributes, key)) {
        valid = false;
      }
    });
    if (!valid) {
      return -1;
    }
    return req.body;
  }

  function getUser(req) {
    if (!validator.isAlphanumeric(req.params.id)) {
      return -1;
    }
    return req.params.id;
  }

  return attributes;
};
