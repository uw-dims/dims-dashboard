'use strict';

// Settings routes - retrieve and update settings via REST api for the logged in user

var config = require('../config/config');
var logger = require('../utils/logger');
var UserSettings = require('../models/userSettings')

exports.get = function (req, res) {
  // id is from logged in user
  var id = req.user.get('ident');

  var userSettings = new UserSettings(id);
  userSettings.getSettings()
  .then(function (data) {
    logger.debug('routes/settings.get  settings: ', data);
    res.status(200).send({data: data});
  }).then(function (err) {
    return res.status(400).send(err);
  });
};

exports.update = function (req, res) {
  var id = req.user.get('ident');
  var newSettings = req.body.settings;

  var userSettings = new UserSettings(id, req.body.settings);
  userSettings.updateSettings()
  .then(function (data) {
    logger.debug('routes/settings.set settings: ', data);
    res.status(200).send({data: data});
  }).then(function (err) {
    return res.status(400).send(err);
  });
};

