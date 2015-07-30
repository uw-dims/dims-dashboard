// File: models/userSettings.js

'use strict';

// userSettings model
// Queries redis to read/update/create user settings

var _ = require('lodash-compat'),
    config = require('../config/config'),
    logger = require('../utils/logger'),
    keyGen = require('./keyGen')

module.exports = function UserSettings(db) {

  // In progress: refactoring
  var userSettingsFactory = function userSettingsFactory(user, userSettings) {
    var self = this;
    var settingsConfig = {};
    // Merge with default settings
    var settingsConfig = _.extend({}, config.defaultUserSettings, userSettings);
    // Return new object from prototype and config
    var finalSettings = {
      settings: settingsConfig,
      user: user
    };
    return _.create(userSettingsPrototype, finalSettings);
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
    return db.sadd(keySetKey, key);
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

    // Get the settings from db for this user. Returns userSettings object.
    retrieveSettings: function retrieveSettings() {
      var self = this;
      return get(keyGen.userSettingsKey(self))
      .then(function (reply) {
        // update the object
        self.settings = reply;
        // Return the object so it can be used
        return self;
      })
      .catch(function (err) {
        return new Error(err.toString());
      });
    },

    // Save this user's current settings
    saveSettings: function saveSettings() {
      var self = this;
      return save(keyGen.userSettingsKey(self), self.settings)
      .then(function (reply) {
        // Save the key for this user's settings
        return saveKey(keyGen.userSettingsSetKey(), keyGen.userSettingsKey(self));
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
