'use strict';

// Settings routes - retrieve and update settings via REST api for the logged in user

var config = require('../config');
var logger = require('../utils/logger');
var UserSettings = require('../models/userSettings')

exports.get = function(req, res) {
	// id is from logged in user
	var id = req.user.get('ident');
	var client = req.app.get('client');

	var userSettings = new UserSettings(client, id);
	userSettings.getSettings().then(function(data) {
      res.status(200).send({data: data});
    }).then(function(err) {
      return res.status(400).send(err);
    });
};

exports.update = function(req, res) {
	var id = req.user.get('ident');
	var client = req.app.get('client');
	var newSettings = req.body.settings;
	
	var userSettings = new UserSettings(client, id, req.body.settings);
	userSettings.updateSettings().then(function(data) {
      res.status(200).send({data: data});
    }).then(function(err) {
      return res.status(400).send(err);
    });
};

