'use strict';

// userSettings model
// Queries redis to read/update/create user settings

var config = require('../config');
var logger = require('../utils/logger');

exports = module.exports = UserSettings;

function UserSettings(client, user, userSettings) {
	var self = this;
	self.client = client;
	self.user = user;
	self.userSettings = userSettings || {};
	self.key = 'userSetting:' + user;
};

// Will retrieve settings for logged in user. If settings do not
// exist, will return null data.
UserSettings.prototype.getSettings = function(callback) {
	var self = this;
	self.client.hgetall(this.key, function(err, data) {
			return callback(err, data);
	});
};

// Updates settings for current logged in user
UserSettings.prototype.updateSettings = function(callback) {
	var self = this;
	logger.debug('updateSettings, userSettings ', self.userSettings);
	  self.client.hmset(self.key, self.userSettings, function(err, data) {
			return callback(err, data);
	  });
};

UserSettings.prototype.get

// Create settings for current logged in user
UserSettings.prototype.createSettings = function(callback) {
	var settingsObject = config.defaultUserSettings,
			self = this;

		// First put the key in the set of keys

	  self.client.hmset(self.key, self.settingsObject, function(err, data) {
	  	if (err) {
				return callback(err, null);
			} else {
				self.client.hgetall(self.key, function(err, data) {
					return callback(err, data);
				});
			}
	  });
};

UserSettings.prototype.getAllKeys = function(callback) {

};

UserSettings.prototype.updateKey = function(callback) {

};

// module.exports = function(client, user, userSettings) {

// 	var settings = {};
// 	var key = 'userSetting:' + user;

// 	settings.getSettings = function(callback) {
// 		client.hgetall(key, function(err, data) {
// 			return callback(err, data);
// 		});
// 	};

// 	settings.updateSettings = function(callback) {
// 		logger.debug('updateSettings, userSettings ', userSettings);
// 	  client.hmset(key, userSettings, function(err, data) {
// 			return callback(err, data);
// 	  });
// 	};

// 	settings.createSettings = function(callback) {
// 		var settingsObject = config.defaultUserSettings;

// 	  client.hmset(key, settingsObject, function(err, data) {
// 	  	if (err) {
// 				return callback(err, null);
// 			} else {
// 				client.hgetall(key, function(err, data) {
// 					return callback(err, data);
// 				});
// 			}
// 	  });
// 	};

// 	return settings;
// };

