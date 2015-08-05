'use strict';

// Settings routes - retrieve and update settings via REST api for the logged in user

var config = require('../config/config');
var logger = require('../utils/logger');
// var UserSettings = require('../models/userSettings')

module.exports = function (UserSettings) {
  var settings = {};

  settings.get = function (req, res) {
    // id is from logged in user
    var id = req.user.get('ident');

    // Create new UserSettings object
    var userSettings = UserSettings.userSettingsFactory(id);
    // Get saved settings for this user
    return userSettings.retrieveSettings()
    .then(function (data) {
      logger.debug('routes/settings.get  settings: ', data);
      res.status(200).send({data: data});
    }).then(function (err) {
      return res.status(400).send(err);
    });
  };

  settings.update = function (req, res) {
    var id = req.user.get('ident');
    var newSettings = req.body.settings;

    var userSettings = UserSettings.userSettingsFactory(id, req.body.settings);
    userSettings.saveSettings()
    .then(function (data) {
      logger.debug('routes/settings.set settings: ', data);
      res.status(200).send({data: data});
    }).then(function (err) {
      return res.status(400).send(err);
    });
  };
  return settings;
};

