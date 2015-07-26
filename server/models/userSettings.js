// File: models/userSettings.js

'use strict';

// userSettings model
// Queries redis to read/update/create user settings

var config = require('../config'),
    logger = require('../utils/logger'),
    keyGen = require('./keyGen')

module.exports = function UserSettings(db) {

  // In progress: refactoring
  var userSettingsFactory = function userSettingsFactory(user, userSettings) {
    var config = {};
    config.userSettings = userSettings; 
    config.user = user;
    return _.create(userSettingsPrototype, config);
  };

  // function UserSettings(user, userSettings) {

  // Update a setting
  // self.update = function (settings) {
  //   // var deferred = q.defer();
  //   client.hmset(self.key, settings, function (err, data) {
  //     if (err) deferred.reject(err);
  //     else deferred.resolve(data);
  //   });
  //   return deferred.promise;
  // };
  // // Get a setting for the logged in user
  // self.get = function () {
  //   var deferred = q.defer();
  //   client.hgetall(self.key, function (err,data) {
  //     if (err) deferred.reject(err);
  //     else deferred.resolve(data);
  //   });
  //   return deferred.promise;
  // };

  // };

  // Wrap the redis function for update, return promise
  var update = function update(key, settings) {
    // var deferred = q.defer();
    return db.hmset(key, settings);
  };

  // Wrap the redis function for get, return promise
  var get = function get(key) {
    return db.hgetall(key);
  };

  // get Settings for a user
  var getSettings = function getSettings(user) {
    // Save for later in the chain
    var thisUser = user;
    // Retrieve the settings for this user via user settings key if they exist
    return get(keyGen.userSettingsKey(thisUser))
    .then(function (reply) {
      // Merge with default in case the settings are null
      var settings = _.extend({}, config.defaultUserSettings, reply);
      // Create settings object
      var settingsObject = userSettingsFactory(thisUser, settings);
    })
  };


  var userSettingsPrototype = {
    // Will retrieve settings for logged in user. If settings do not
    // exist, create settings using default.
    getSettings: function getSettings() {
      var self = this;
      // var deferred = q.defer();
      self.get().then(function (data) {
        // Settings exist, so resolve promise
        if (data) {
          return data;
        } else {
          // Settings do not exist - create them
          var settingsObject = config.defaultUserSettings;
          // Create the setting
          self.update(settingsObject);
          // Add the key to the keyset
          self.updateKey();
          return settingsObject;
        }
      })
      .catch(function (err) {
        return new Error(err.toString());
      });
    },

    // Updates settings for current logged in user
    updateSettings: function updateSettings() {
      var self = this;
      var deferred = q.defer();
      self.update(self.userSettings).then(function (data) {
        return deferred.resolve(data);
      }).then(function (err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    },

    updateKey: function updateKey() {
      var self = this;
      client.sadd(self.keySet, self.key);
    }
  };
};
