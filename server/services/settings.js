'use strict';

// Settings routes - retrieve and update settings via REST api for the logged in user

var config = require('../config');
var logger = require('../utils/logger');
var UserSettings = require('../models/userSettings');
var q = require('q');

exports.get = function(user) {
  var deferred = q.defer();
  logger.debug('/services/settings.get user is ', user);
  var userSettings = new UserSettings(user);
  userSettings.getSettings().then(function(reply) {
    logger.debug('/services/settings.get reply is ', reply);
    deferred.resolve(reply);
  }, function(err, reply) {
    deferred.reject(err);
  });

  return deferred.promise;

};