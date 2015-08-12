// File: models/userSettings.js

'use strict';

// userSettings model
// Queries redis to read/update/create user settings

var _ = require('lodash-compat'),
    q = require('q'),
    config = require('../config/config'),
    logger = require('../utils/logger')(module),
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

  // create and save a userSetting object for a user
  var create = function create(user, settings) {
    var deferred = q.defer();
    var multi = db.multi();
    multi.hmset(keyGen.userSettingsKey(user), settings);
    multi.sadd(keyGen.userSettingsSetKey(), keyGen.userSettingsKey(user));
    multi.exec(function (err, replies) {
      if (err) {
        deferred.reject(new Error(err));
      } else {
        logger.debug('models/userSettings.js create: replies from create', replies);
        deferred.resolve('ok');
      }
    });
    return deferred.promise;
  };

  var save = function save(user, settings) {
    return db.hmsetProxy(keyGen.userSettingsKey(user), settings);
  };

  // Wrap the redis function for get, return promise
  var get = function get(user) {
    return db.hgetallProxy(keyGen.userSettingsKey(user));
  };

  var exists = function (user) {
    return db.sismemberProxy(keyGen.userSettingsSetKey(), keyGen.userSettingsKey(user));
  };

  // Static function to get settings object for a user. Returns userSettings object.
  var getUserSettings = function getUserSettings(user) {
    // Save for later in the chain
    var thisUser = user;
    var newUserSettings;
    logger.debug('model/userSettings.js getUserSettings static function. user = ', user);
    // Retrieve the settings for this user via user settings key. Return null if no settings exist.
    return exists(thisUser)
    .then(function (reply) {
      if (reply === 0) {
        newUserSettings = userSettingsFactory(thisUser);
        logger.debug('model/userSettings.js getUserSettings new settings ', newUserSettings.settings);
        return create(thisUser, newUserSettings.settings).then(function (reply) {
          return newUserSettings;
        });
      } else {
        return get(thisUser).then(function (reply) {
          var newSettings = convertBoolean(reply);
          return userSettingsFactory(thisUser, newSettings);
        });
      }
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

    createSettings: function createSettings() {
      var self = this;
      return create(self.user, self.settings);
    },

    // Get the settings from db for this user. Returns settings object.
    retrieveSettings: function retrieveSettings() {
      var self = this;
      return exists(self.user)
      .then(function (reply) {
        if (reply === 0) {
          return create(self.user, self.settings).then(function (reply) {
            return self.settings;
          });
        } else {
          return get(self.user).then(function (reply) {
            self.settings = convertBoolean(reply);
            // self.settings = reply;
            return self.settings;
          });
        }
      })
      .catch(function (err) {
        return new Error(err.toString());
      });
    },

    // Save this user's current settings
    saveSettings: function saveSettings() {
      var self = this;
      logger.debug('model/userSettings.js saveSettings initial settings are', self.settings);
      return save(self.user, self.settings);
    }
  };

  return {
    getUserSettings: getUserSettings,
    userSettingsFactory: userSettingsFactory
  };
};
