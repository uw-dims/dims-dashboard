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
    var promises = [];
    if (type === 'tlp') {
      // Always have one value for tlp
      // TODO: generalize this so more than one type can be restricted to one value
      // Delete the key if it exists - serves to delete any existing value of tlp
      promises.push(client.del(keyGen.attributeKey(user, type)));
    }
    // Add the value to the set
    promises.push(client.saddAsync(keyGen.attributeKey(user, type), value));
    // Add/update the list of keys with this key (will update score if key already exists);
    promises.push(client.zaddAsync(keyGen.attributeSetKey(type), dimsUtils.createTimestamp(), keyGen.attributeKey(user, type)));
    return q.all(promises);
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
    var promises = [],
        users = [],
        zipped,
        result = {};
    // Get the keys needed
    return client.zrangeAsync(keyGen.attributeSetKey(), 0, -1)
    .then(function (reply) {
      // Get the individual attributes for each user by key
      _.forEach(reply, function (value, index) {
        // get the user from the key
        users.push(keyExtract.userFromAttribute(value));
        // attributes for this key
        promises.push(get(keyExtract.userFromAttribute(value), keyExtract.typeFromAttribute(value)));
      });
      return q.all(promises)
      .then(function (reply) {
        zipped = _.zip(users, reply);
        // Aggregate for each unique user
        _.forEach(_.uniq(users), function (thisUser) {
          var thisUserZipped,
              interResult;
          // intialize
          result[thisUser] = {};
          // Get results from zipped for thisUser
          thisUserZipped = _.filter(zipped, function (item) {
            return item[0] === thisUser;
          });
          // Drop the user from the array so all we have are attributes
          interResult = _.drop(_.uniq(_.flatten(thisUserZipped)), 1);
          // Extend the result object for this user
          _.forEach(interResult, function (value) {
            _.assign(result[thisUser], value);
          });
        });
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
      _.forEach(reply, function (value, index) {
        _.assign(attributes[user], value);
      });
      return attributes;
    })
    .catch(function (err) {
      logger.error('Could not get attributes for this user', err);
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
