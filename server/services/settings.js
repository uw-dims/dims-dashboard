'use strict';

// Settings routes - retrieve and update settings via REST api for the logged in user

var config = require('../config/config');
var logger = require('../utils/logger');
var UserSettings = require('../models/userSettings')(require('../utils/redisDB'));
var q = require('q');

module.exports.get = function (user) {
  var deferred = q.defer();
  logger.debug('/services/settings.get user is ', user);
  // var userSettings = UserSetting.userSettingsFactory(user)

  // UserSettings.getUserSetting(user)


  userSettings.retrieveSettings().then(function (reply) {
    logger.debug('/services/settings.get reply is ', reply);
    deferred.resolve(reply);
  }, function (err, reply) {
    deferred.reject(err);
  });

  return deferred.promise;
};
