'use strict';

var config = require('../config');
var logger = require('../utils/logger');

module.exports = function(client, user, userSettings) {

	var settings = {};
	var key = 'userSetting:' + user;

	settings.getSettings = function(callback) {
		var result;
		client.hgetall(key, function(err, data) {
			if (err) {
				result = { status: 'error', data:null, message: 'Error retrieving from database:' + err };
			} else if (data !== null) {
				result = { status: 'success', data: data, message:'' };
			} else {
				result = { status: 'success', message: 'No settings exist for this user' };
			}
			return callback(result);
		});
	};

	settings.updateSettings = function(callback) {
		var result;
		var settingsObject = JSON.parse(userSettings);
	  client.hmset(key, settingsObject, function(err, data) {
	  	if (err) {
				result = 'Error setting data in database';
			} else {
				result = data;
			}
			return callback(result);
	  });
	};

	settings.createSettings = function(callback) {
		var result;
		var settingsObject = config.defaultUserSettings;
	  client.hmset(key, settingsObject, function(err, data) {
	  	if (err) {
				result = 'Error setting data in database';
				return callback(result);
			} else {
				client.hgetall(key, function(err, data) {
					if (err) {
						return callback('Error retrieving created data in database');
					} else {
						return callback({data: data});
					}
				});
			}
			
	  });
	};

	return settings;
};

