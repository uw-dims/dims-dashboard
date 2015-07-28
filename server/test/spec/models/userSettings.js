'use strict'

var test = require('tape-catch');

var _ = require('lodash-compat');
var logger = require('../../../utils/logger');

// Redis mock
// We will use blocking form for simplicity in test assertions
var client = require('redis-js').createClient();

var keyGen = require('../../../models/keyGen');
var extract = require('../../../models/keyExtract');

// Setup service discovery for this test
var diContainer = require('../../../services/diContainer')();
diContainer.factory('db', require('../../../utils/redisProxy'));
diContainer.factory('UserSettings', require('../../../models/userSettings'));
diContainer.register('client', client);
var UserSettings = diContainer.get('UserSettings');

// Some data
var user1 = 'user1';
var settings1 = {
  'anonymize': true,
  'rpcVerbose': false
};

var settings2 = {
  'anonymize': true,
  'rpcDebug': false
};

var settings3 = {
  'anonymize': true,
  'rpcVerbose': false,
  'rpcDebug': false,
  'cifbulkQueue': 'cifbulk_v2'
};

var settings4 = {
  'anonymize': false,
  'rpcDebug': true
};

test('models/userSettings: userSettingsFactory should return User Settings object', function (assert) {
  // Get a settings object with no options
  var settings = UserSettings.userSettingsFactory(user1);
  assert.equal(typeof (settings.getSettings), 'function', 'Object should have getSettings function');
  assert.equal(typeof (settings.saveSettings), 'function', 'Object should have saveSettings function');
  assert.ok(settings.hasOwnProperty('settings'), 'Object should have settings property');
  assert.ok(settings.hasOwnProperty('user'), 'Object should have user property');
  assert.equal(settings.user, user1, 'Object should have user = user1');
  assert.equal(settings.settings.anonymize, false, 'Default object should use default values');
  assert.equal(settings.settings.rpcDebug, true, 'Default object should use default values');
  assert.equal(settings.settings.rpcVerbose, true, 'Default object should use default values');
  assert.equal(settings.settings.cifbulkQueue, 'cifbulk_v1', 'Default object should use default values');
  // Get another new settings object with some options
  settings = UserSettings.userSettingsFactory(user1, settings1);
  assert.equal(settings.settings.anonymize, true, 'Options should override defaults');
  assert.equal(settings.settings.rpcDebug, true, 'Default value prevails if no value supplied in options');
  assert.equal(settings.settings.rpcVerbose, false, 'Options should override defaults');
  assert.equal(settings.settings.cifbulkQueue, 'cifbulk_v1', 'Default value prevails if no value supplied in options');
  assert.end();
});

test('models/userSettings: UserSettings object saveSettings method should save settings and key', function (assert) {
  var settings = UserSettings.userSettingsFactory(user1, settings1);
  return settings.saveSettings()
  .then(function (reply) {
    assert.deepEqual(client.hgetall(keyGen.userSettingsKey(settings)), settings.settings, 'Settings retrieved via key were same as saved settings');
    assert.ok(client.sismember(keyGen.userSettingsSetKey(), keyGen.userSettingsKey(settings)), 'Settings key was saved in set');
    assert.end();
  })
  .catch(function (err) {
    return new Error(err.toString());
  });
});

test('models/userSettings: UserSettings object setSettings method sets the object settings', function (assert) {
  var settings = UserSettings.userSettingsFactory(user1, settings1);
  var initialSettings = settings.settings;
  // Replace settings
  settings.setSettings(settings3);
  assert.deepEqual(settings.settings, settings3, 'Object has new settings value');
  // Change just two of the settings
  settings.setSettings(settings4);
  assert.notOk(settings.settings.anonymize, 'New setting was applied');
  assert.ok(settings.settings.rpcDebug, 'New setting was applied');
  assert.notOk(settings.settings.rpcVerbose, 'Unchanged setting was not updated');
  assert.equal(settings.settings.cifbulkQueue, 'cifbulk_v2', 'Unchanged setting was not updated')
  assert.end();
});

test('models/userSettings: UserSettings object getSettings method returns the object settings', function (assert) {
  var settings = UserSettings.userSettingsFactory(user1, settings1);
  // Get settings directly
  var currentSettings = settings.settings;
  // Now get via method
  var newSettings = settings.getSettings();
  assert.deepEqual(newSettings, currentSettings, 'Settings were returned');
  assert.end();
});

test('models/userSettings: UserSettings object getUser method gets the object user', function (assert) {
  var settings = UserSettings.userSettingsFactory(user1, settings1);
  var newUser = settings.getUser();
  assert.equal(newUser, user1, 'User was returned');
  assert.end();
});

test('models/userSettings: UserSettings object retrieveSettings method gets the settings from db', function (assert) {
  var settings = UserSettings.userSettingsFactory(user1, settings1);
  // Save the settings
  return settings.saveSettings()
  .then(function (reply) {
    // Get a new default object for the user
    var newSettings = UserSettings.userSettingsFactory(user1);
    assert.notDeepEqual(newSettings.settings, settings.settings, 'New object has different settings than original');
    return newSettings.retrieveSettings()
  })
  .then(function (reply) {
    // Have to re-declare it here
    var newSettings = reply;
    assert.deepEqual(reply.settings, settings.settings, 'Object retrieveSettings method returned the object with updated settings matching original');
    assert.end();
  })
  .catch(function (err) {
    return new Error(err.toString());
  });
});
