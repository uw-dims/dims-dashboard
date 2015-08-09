// File: models/userSettings.js

'use strict';

// userSettings model
// Queries redis to read/update/create user settings

var _ = require('lodash-compat'),
    config = require('../config/config'),
    logger = require('../utils/logger'),
    keyGen = require('./keyGen');

module.exports = function UserSettings(db) {

  var convertBoolean = function convertBoolean(config) {
    for (var key in config) {
      config[key] = getBoolean(config[key]);
    }
    return config;
  };

  var getBoolean = function (stringVal) {
    if (stringVal === 'true') {
      return true;
    } else if (stringVal === 'false') {
      return false;
    } else {
      return stringVal;
    }
  };

  // In progress: refactoring
  var userSettingsFactory = function userSettingsFactory(user, userSettings) {
    // Merge with default settings
    var settingsConfig = _.extend({}, config.defaultUserSettings, userSettings);
    // Return new object from prototype and config
    var finalSettings = {
      settings: settingsConfig,
      user: user
    };
    return _.create(userSettingsPrototype, finalSettings);
  };

  // // Wrap the redis function for update, return promise
  // var save = function save(key, settings) {
  //   return db.hmset(key, settings);
  // };

  // // Wrap the redis function for get, return promise
  // var get = function get(key) {
  //   return db.hgetall(key);
  // };

  // Saves key in key set. Returns promise
  // var saveKey = function saveKey(keySetKey, key) {
  //   return db.sadd(keySetKey, key);
  // };

  // Static function to get settings object for a user. Returns userSettings object.
  var getUserSettings = function getUserSettings(user) {
    // Save for later in the chain
    var thisUser = user;
    // Retrieve the settings for this user via user settings key. Return null if no settings exist.
    return db.hgetallProxy(keyGen.userSettingsKey(thisUser))
    .then(function (reply) {
      // Create settings object and return
      var newSettings = convertBoolean(reply);
      logger.debug('model/userSettings getUserSettings for user ', user, 'reply', newSettings);
      return userSettingsFactory(thisUser, newSettings);
    })
    .catch(function (err) {
      return new Error(err.toString());
    });
  };

  // Prototype for userSettings object
  var userSettingsPrototype = {

    setSettings: function setSettings(settings) {
      var self = this;
      var oldSettings = self.settings;
      // Apply the new settings to the old
      self.settings = _.extend({}, oldSettings, settings);
    },
    getSettings: function getSettings() {
      var self = this;
      return self.settings;
    },
    getUser: function getUser() {
      var self = this;
      return self.user;
    },
    setUser: function setUser(user) {
      var self = this;
      self.user = user;
    },

    // Get the settings from db for this user. Returns settings object.
    retrieveSettings: function retrieveSettings() {
      var self = this;
      return db.hgetallProxy(keyGen.userSettingsKey(self))
      .then(function (reply) {
        // update the object
        logger.debug('model/userSettings.js retrieveSettings: key ', keyGen.userSettingsKey(self));
        logger.debug('model/userSettings.js retrieveSettings: reply ', reply);
        // Return the object so it can be used
        return convertBoolean(reply);
      })
      .catch(function (err) {
        return new Error(err.toString());
      });
    },

    // Save this user's current settings
    saveSettings: function saveSettings() {
      var self = this;
      logger.debug('model/userSettings.js saveSettings initial settings are', self.settings);
      return db.hmsetProxy(keyGen.userSettingsKey(self), self.settings)
      .then(function (reply) {
        logger.debug('model/userSettings.js saveSettings: reply from hmset', reply);
        // Save the key for this user's settings
        logger.debug('model/userSettings.js saveSettings: key is ', keyGen.userSettingsKey(self));
        logger.debug('model/userSettings.js saveSettings: set key is ', keyGen.userSettingsSetKey());
        return db.saddProxy(keyGen.userSettingsSetKey(), keyGen.userSettingsKey(self));
      })
      .catch(function (err) {
        return new Error(err.toString());
      });
    }
  };

  return {
    getUserSettings: getUserSettings,
    userSettingsFactory: userSettingsFactory
  };
};
