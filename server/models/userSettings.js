'use strict';

// userSettings model
// Queries redis to read/update/create user settings

var config = require('../config');
var logger = require('../utils/logger');
var q = require('q');

exports = module.exports = UserSettings;

function UserSettings(client, user, userSettings) {
	var self = this;
	self.client = client;
	self.user = user;
	self.userSettings = userSettings || {};
	self.key = 'userSetting:' + user;
	self.keySet = 'userSettings';

	self.update = function(settings) {
		logger.debug('self.update');
		var deferred = q.defer();
		self.client.hmset(self.key, settings, function(err, data) {
			if (err) deferred.reject(err);
			else deferred.resolve(data);
		});
		return deferred.promise;
	};

	self.get = function() {
		logger.debug('self.get');
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
	logger.debug('prototype.getSettings');
	var self = this;
	var deferred = q.defer();
	self.get().then(function(data) {
		logger.debug('prototype.getSettings. data is ', data);
		if (data) deferred.resolve(data);
		else {
			var settingsObject = config.defaultUserSettings;
			self.update(settingsObject);
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
	logger.debug('prototype.updateSettings');
	var self = this;
	var deferred = q.defer();
	self.update(self.userSettings).then(function(data){
		return deferred.resolve(data);
	}).then(function(err) {
		return deferred.reject(err);
	});
	return deferred.promise;
};

UserSettings.prototype.getAllKeys = function() {

};

UserSettings.prototype.updateKey = function() {
	logger.debug('prototype.updateKey');
	var self = this;
	self.client.sadd(self.keySet, self.key);
};

