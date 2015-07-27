// File: models/userSettings.js

'use strict';

// userSettings model
// Queries redis to read/update/create user settings

var _ = require('lodash'),
    config = require('../config'),
    logger = require('../utils/logger'),
    keyGen = require('./keyGen')

module.exports = function UserSettings(db) {

  // In progress: refactoring
  var userSettingsFactory = function userSettingsFactory(user, userSettings) {
    logger.debug('userSettings are ', userSettings);
    logger.debug('defaults are ', config.defaultUserSettings);
    var settingsConfig = {};
    // Merge with default settings
    var settingsConfig = _.extend({}, config.defaultUserSettings, userSettings);
    logger.debug('settings are ', settingsConfig);
    logger.debug('user is ', user);
    config.settings = settingsConfig;
    config.user = user;
    logger.debug('config is ', config);
    // Return new object from prototype and config
    return _.create(userSettingsPrototype, config);
  };

  // Wrap the redis function for update, return promise
  var save = function save(key, settings) {
    return db.hmset(key, settings);
  };

  // Wrap the redis function for get, return promise
  var get = function get(key) {
    return db.hgetall(key);
  };

  // Saves key in key set. Returns promise
  var saveKey = function saveKey(keySetKey, key) {
    return db.sadd(keyGen(userSettingsSetKey), keyGen(userSettingsKey));
  };

  // Static function to get settings object for a user. Returns userSettings object.
  var getUserSettings = function getUserSettings(user) {
    // Save for later in the chain
    var thisUser = user;
    // Retrieve the settings for this user via user settings key. Return null if no settings exist.
    return get(keyGen.userSettingsKey(thisUser))
    .then(function (reply) {
      // Create settings object and return
      return userSettingsFactory(thisUser, settings);
    })
    .catch(function (err) {
      return new Error(err.toString());
    });
  };

  // Prototype for userSettings object
  var userSettingsPrototype = {

    // Get the settings from db for this user
    get: function get() {
      var self = this;
      return get(keyGen.userSettingsKey(self))
      .catch(function (err) {
        return new Error(err.toString());
      });
    },

    // Save this user's current settings
    save: function save() {
      var self = this;
      console.log(self);
      return save(keyGen.userSettingsKey(self), self.settings)
      .then(function (reply) {
        // Save the key for this user's settings
        return saveKey(keyGen.userSettingsSetKey(self), keyGen.userSettingsKey(self));
      })
      .catch(function (err) {
        return new Error(err.toString());
      });
    }
  };

  return {
    getUserSettings: getUserSettings,
    userSettingsFactory: userSettingsFactory
  }
};
