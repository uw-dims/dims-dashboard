'use strict';

// userSettings model
// Queries redis to read/update/create user settings

var config = require('../config');
var redisScheme = require('../redisScheme');
var logger = require('../utils/logger');
var q = require('q');

exports = module.exports = UserSettings;

function UserSettings(client, user, userSettings) {
	var self = this;
	self.client = client;
	self.user = user;
	self.userSettings = userSettings || {};

	// Redis set that holds all keys for userSettings
	self.keySet = redisScheme.userSettings.set;
	// Construct key for this user
	self.key = redisScheme.userSettings.prefix + redisScheme.delimiter + user;

	// Update a setting
	self.update = function(settings) {
		var deferred = q.defer();
		self.client.hmset(self.key, settings, function(err, data) {
			if (err) deferred.reject(err);
			else deferred.resolve(data);
		});
		return deferred.promise;
	};
	// Get a setting for the logged in user
	self.get = function() {
		var deferred = q.defer();
		self.client.hgetall(self.key, function(err,data) {
			if (err) deferred.reject(err);
			else deferred.resolve(data);
		});
		return deferred.promise;
	};

};

// Will retrieve settings for logged in user. If settings do not
// exist, create settings using default.
UserSettings.prototype.getSettings = function() {
	var self = this;
	var deferred = q.defer();
	self.get().then(function(data) {
		// Settings exist, so resolve promise
		if (data) deferred.resolve(data);
		else {
			// Settings do not exist - create them
			var settingsObject = config.defaultUserSettings;
			// Create the setting
			self.update(settingsObject);
			// Add the key to the keyset
			self.updateKey();
			deferred.resolve(settingsObject);
		}
	}).then(function(err) {
		deferred.reject(err);
	});
	return deferred.promise;
};

// Updates settings for current logged in user
UserSettings.prototype.updateSettings = function() {
	var self = this;
	var deferred = q.defer();
	self.update(self.userSettings).then(function(data){
		return deferred.resolve(data);
	}).then(function(err) {
		return deferred.reject(err);
	});
	return deferred.promise;
};

UserSettings.prototype.updateKey = function() {
	var self = this;
	self.client.sadd(self.keySet, self.key);
};

