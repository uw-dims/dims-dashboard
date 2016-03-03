/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
'use strict';

// userSettings model
// Queries redis to read/update/create user settings

var _ = require('lodash-compat'),
    q = require('q'),
    config = require('../config/config'),
    logger = require('../utils/logger')(module),
    keyGen = require('./keyGen');

module.exports = function UserSettings(client) {

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
    // var deferred = q.defer();
    // var multi = client.multi();
    return q.all([
      client.setAsync(keyGen.userSettingsKey(user), JSON.stringify(settings)),
      client.saddAsync(keyGen.userSettingsSetKey(), keyGen.userSettingsKey(user))
    ]);
  };

  var save = function save(user, settings) {
    return client.setAsync(keyGen.userSettingsKey(user), JSON.stringify(settings));
  };

  // Wrap the redis function for get, return promise
  var get = function get(user) {
    return client.getAsync(keyGen.userSettingsKey(user))
    .then(function (reply) {
      return JSON.parse(reply);
    })
    .catch(function (err) {
      throw err;
    });
  };

  var exists = function (user) {
    logger.debug('exists - userSettings set key is ', keyGen.userSettingsSetKey());
    logger.debug('exists - userSettings key is ', keyGen.userSettingsKey(user));
    return client.sismemberAsync(keyGen.userSettingsSetKey(), keyGen.userSettingsKey(user));
  };

  // Static function to get settings object for a user. Returns userSettings object.
  var getUserSettings = function getUserSettings(user) {
    // Save for later in the chain
    var thisUser = user;
    var newUserSettings;
    // Retrieve the settings for this user via user settings key. Return null if no settings exist.
    return exists(thisUser)
    .then(function (reply) {
      if (reply === 0) {
        newUserSettings = userSettingsFactory(thisUser);
        logger.debug('getUserSettings new settings ', newUserSettings.settings);
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
      logger.error('getUserSettings error', err.toString());
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
      logger.debug('saveSettings initial settings are', self.settings);
      return save(self.user, self.settings);
    }
  };

  return {
    getUserSettings: getUserSettings,
    userSettingsFactory: userSettingsFactory
  };
};
