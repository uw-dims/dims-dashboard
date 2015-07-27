'use strict'

var test = require('tape');

var _ = require('lodash');
var stream = require('stream');

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

test('models/userSettings: userSettingsFactory should return User Settings object', function (assert) {
  var settings = UserSettings.userSettingsFactory(user1);
  assert.equal(typeof (settings.get), 'function', 'Object should have get function');
  assert.equal(typeof (settings.save), 'function', 'Object should have save function');
  assert.ok(settings.hasOwnProperty('settings'), 'Object should have settings property');
  assert.ok(settings.hasOwnProperty('user'), 'Object should have user property');
  assert.equal(settings.user, user1, 'Object should have user = user1');
  assert.equal(settings.settings.anonymize, false, 'Default object should use default values');
  assert.equal(settings.settings.rpcDebug, true, 'Default object should use default values');
  assert.equal(settings.settings.rpcVerbose, true, 'Default object should use default values');
  assert.equal(settings.settings.cifbulkQueue, 'cifbulk_v1', 'Default object should use default values');
  settings = UserSettings.userSettingsFactory(user1, settings1);
  assert.equal(settings.settings.anonymize, true, 'Options should override defaults');
  assert.equal(settings.settings.rpcDebug, true, 'Default value prevails if no value supplied in options');
  assert.equal(settings.settings.rpcVerbose, false, 'Options should override defaults');
  assert.equal(settings.settings.cifbulkQueue, 'cifbulk_v1', 'Default value prevails if no value supplied in options');
  assert.end();
});

test('models/userSettings: UserSettings object save method should save settings and key', function (assert) {
  var settings = UserSettings.userSettingsFactory(user1, settings1);
  logger.debug('settings are ', settings.settings);
  logger.debug('user is ', settings.user);
  logger.debug('key is ', keyGen.userSettingsKey(settings));
  return settings.save()
  .then(function (reply) {
    logger.debug('reply is ', reply);
    // assert.deepEqual(client.hgetall(keyGen.userSettingsKey(settings)), settings.settings, 'Settings were saved with correct key');
    assert.end();
  })
  .catch(function (err) {
    return new Error(err.toString());
  });
})
