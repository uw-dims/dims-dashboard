'use strict';

// File: model/attributes.js

var _ = require('lodash-compat'),
    q = require('q'),
    config = require('../config/config'),
    logger = require('../utils/logger')(module),
    keyGen = require('./keyGen'),
    keyExtract = require('./keyExtract'),
    dimsUtils = require('../utils/util'),
    naturalSort = require('javascript-natural-sort');

module.exports = function Attributes(client) {

  // Not sure yet if we need a config object for all the attributes
  // in this - maybe just return empty config applied on the
  // prototype?
  var attributesFactory = function attributesFactory(user) {
    var attributes = {};
    attributes[user] = {};
    // Populate empty config
    _.forEach(config.defaultAttributes, function (value, index) {
      attributes[user][value] = [];
    });
    return _.create(attributesPrototype, attributes);
  };

  // Save or update an attribute
  // Value is array - can be >= 0 entries
  // Since we're using sets and sorted sets, can use same function for save and create
  var save = function save(user, type, value) {
    logger.debug('save: user=%s type=%s value=%s', user, type, value);
    return q.all([
      client.saddAsync(keyGen.attributeKey(user, type), value),
      client.zaddAsync(keyGen.attributeSetKey(type), dimsUtils.createTimestamp(), keyGen.attributeKey(user, type))
    ]);
  };

  var remove = function remove(user, type, value) {
    logger.debug('remove: user=%s type=%s value=%s', user, type, value);
    return q.all([
      client.sremAsync(keyGen.attributeKey(user, type), value),
      client.zaddAsync(keyGen.attributeSetKey(type), dimsUtils.createTimestamp(), keyGen.attributeKey(user, type))
    ]);
  };

  // Get an attribute (returns promise with array of values);
  var get = function get(user, type) {
    var result = {};
    return client.smembersAsync(keyGen.attributeKey(user, type))
    .then(function (reply) {
      reply.sort(naturalSort);
      result[type] = reply;
      return result;
    })
    .catch(function (err) {
      logger.error('Error from redis', err);
      return new Error(err.toString());
    });
  };

  var attributeExists = function attributeExists(user, type) {
    return client.existsAsync(keyGen.attributeKey(user, type));
  };

  // This saves/updates all attributes
  var updateAttributes = function (user, config) {
    var promises = [];
    _.forEach(config, function (value, key) {
      promises.push(save(user, key, value));
    });
    return q.all(promises);
  };

  var getAllAttributes = function getAllAttributes() {
    var promises = [];
    var users = [];
    return client.zrangeAsync(keyGen.attributeSetKey(), 0, -1)
    .then(function (reply) {
      _.forEach(reply, function (value, index) {
        // get the user from the key
        users.push(keyExtract.userFromAttribute(value));
        logger.debug('user in getAttributes is ', keyExtract.userFromAttribute(value));
        promises.push(get(keyExtract.userFromAttribute(value), keyExtract.typeFromAttribute(value)));
      });
      return q.all(promises)
      .then(function (reply) {
        var zipped = _.zip(users, reply);
        var merged = [];
        var result = {};
        var k = 0;
        while (k < zipped.length) {
          if (k !== zipped.length - 1) {
            if (zipped[k][0] === zipped[k + 1][0]) {
              merged.push((_.merge(zipped[k], zipped[k + 1])));
              k = k + 2;
            } else {
              merged.push((_.merge(zipped[k], zipped[k])));
              k = k + 1;
            }
          } else {
            merged.push((_.merge(zipped[k], zipped[k])));
            k = k + 1;
          }
        }
        for (var j = 0; j < merged.length; j++) {
          result[merged[j][0]] = merged[j][1];
        }
        return result;
      });
    });
  };

  // Get all attributes for a user
  var getAttributes = function getAttributes(user) {
    var promises = [];
    var attributes = {};
    attributes[user] = {};
    _.forEach(config.defaultAttributes, function (value, index) {
      promises.push(get(user, value));
    });
    return q.all(promises)
    .then(function (reply) {
      logger.debug('return from getAttributes', reply);
      _.forEach(reply, function (value, index) {
        logger.debug('value is ', value);
        _.assign(attributes[user], value);
      });
      return attributes;
    })
    .catch(function (err) {
      logger.error('Could not get attributes for this user');
      return new Error(err.toString());
    });
  };

  var attributesPrototype = {
    getAttributes: getAttributes,
    updateAttributes: updateAttributes
  };

  return {
    attributesFactory: attributesFactory,
    getAllAttributes: getAllAttributes,
    save: save,
    remove: remove
  };

};
