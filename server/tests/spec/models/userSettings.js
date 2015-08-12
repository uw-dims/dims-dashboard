'use strict';

var test = require('tape-catch');
var _ = require('lodash-compat');
var logger = require('../../../utils/logger')(module);
var config = require('../../../config/config');
var keyGen = require('../../../models/keyGen');
var extract = require('../../../models/keyExtract');

// Enable service discovery for this test
var diContainer = require('../../../services/diContainer')();
var redis = require('redis');
// var redisJS = require('redis-js');

// if (config.testWithRedis) {
logger.debug('TEST filedata: do the test with redis');
var client = redis.createClient();
// Add the regular proxy to diContainer
client.select(10, function (err, reply) {
  if (err) {
    logger.error('test: redis client received error when selecting database ', err);
  } else {
    logger.debug('test: redis has selected db', 10, 'reply is ', reply);
    // client.flushdb();
  }
});
diContainer.factory('db', require('../../../utils/redisProxy'));
// } else {
//   // We'll use the mock libraries
//   // logger.debug('use mocks');
//   var client = redisJS.createClient();
//   diContainer.factory('redisProxy', require('../../../utils/redisProxy'));
//   diContainer.factory('db', require('../../redisTestProxy'));
// }
diContainer.register('client', client);

diContainer.factory('UserSettings', require('../../../models/userSettings'));
var UserSettings = diContainer.get('UserSettings');
var db = diContainer.get('db');

// Some data
var user1 = 'user1';
var user2 = 'user2';
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

var getBoolean = function (stringVal) {
  if (stringVal === 'true') {
    return true;
  } else if (stringVal === 'false') {
    return false;
  } else {
    return stringVal;
  }
};

var convertBoolean = function convertBoolean(config) {
    for (var key in config) {
      config[key] = getBoolean(config[key]);
    }
    return config;
  };

test('models/userSettings: userSettingsFactory should return User Settings object', function (assert) {
  // Get a settings object with no options
  var userSettings = UserSettings.userSettingsFactory(user1);
  assert.equal(typeof (userSettings.getSettings), 'function', 'Object should have getSettings function');
  assert.equal(typeof (userSettings.saveSettings), 'function', 'Object should have saveSettings function');
  assert.ok(userSettings.hasOwnProperty('settings'), 'Object should have settings property');
  assert.ok(userSettings.hasOwnProperty('user'), 'Object should have user property');
  assert.equal(userSettings.user, user1, 'Object should have user = user1');
  assert.equal(userSettings.settings.anonymize, false, 'Default object should use default values');
  assert.equal(userSettings.settings.rpcDebug, true, 'Default object should use default values');
  assert.equal(userSettings.settings.rpcVerbose, true, 'Default object should use default values');
  assert.equal(userSettings.settings.cifbulkQueue, 'cifbulk_v1', 'Default object should use default values');
  // Get another new settings object with some options
  userSettings = UserSettings.userSettingsFactory(user1, settings1);
  assert.equal(userSettings.settings.anonymize, true, 'Options should override defaults');
  assert.equal(userSettings.settings.rpcDebug, true, 'Default value prevails if no value supplied in options');
  assert.equal(userSettings.settings.rpcVerbose, false, 'Options should override defaults');
  assert.equal(userSettings.settings.cifbulkQueue, 'cifbulk_v1', 'Default value prevails if no value supplied in options');
  assert.end();
});

// test('model/userSettings: debugging save and get', function (assert) {
//   var userSettings = UserSettings.userSettingsFactory('user3', settings1);
//   db.hmsetProxy(keyGen.userSettingsKey(userSettings), userSettings.settings)
//   .then(function (reply) {
//     logger.debug('TEST debug hmset reply is ', reply);
//     return db.hgetallProxy(keyGen.userSettingsKey(userSettings));
//   })
//   .then(function (reply) {
//     logger.debug('TEST debug hmgetall reply is ', reply);
//     assert.end();
//   })
//   .catch(function (err) {
//     return new Error(err.toString());
//   });
// });

// test('model/userSettings: debugging save and get 2', function (assert) {
//   var userSettings = UserSettings.userSettingsFactory('user4', settings1);
//   // db.hmsetProxy(keyGen.userSettingsKey(userSettings), userSettings.settings)
//   userSettings.saveSettings()
//   .then(function (reply) {
//     logger.debug('TEST debug savesettings reply is ', reply);
//     return db.hgetallProxy(keyGen.userSettingsKey(userSettings));
//   })
//   .then(function (reply) {
//     logger.debug('TEST debug hmgetall reply is ', reply);
//     assert.end();
//   })
//   .catch(function (err) {
//     return new Error(err.toString());
//   });
// });



test('models/userSettings: UserSettings object saveSettings method should save settings', function (assert) {
  var userSettings = UserSettings.userSettingsFactory('user5', settings1);
  logger.debug('TEST saveSettings settings are ', userSettings.settings);
  userSettings.saveSettings()
  .then(function (reply) {
    logger.debug('TEST debug savesettings reply is ', reply);
    return db.hgetallProxy(keyGen.userSettingsKey(userSettings));
  })
  .then(function (reply) {
    logger.debug('TEST debug hmgetall reply is ', reply);
    var result = convertBoolean(reply);
    // logger.debug('TEST debug hmgetall result is ', result);
    assert.deepEqual(result, userSettings.settings, 'Settings were saved');
    assert.end();
  })
  .catch(function (err) {
    return new Error(err.toString());
  });
});

test('models/userSettings: UserSettings object createSettings method should save settings', function (assert) {
  var userSettings = UserSettings.userSettingsFactory('user6', settings1);
  logger.debug('TEST saveSettings settings are ', userSettings.settings);
  userSettings.createSettings()
  .then(function (reply) {
    logger.debug('TEST debug createsettings reply is ', reply);
    return db.hgetallProxy(keyGen.userSettingsKey(userSettings));
  })
  .then(function (reply) {
    logger.debug('TEST debug hmgetall reply is ', reply);
    var result = convertBoolean(reply);
    // logger.debug('TEST debug hmgetall result is ', result);
    assert.deepEqual(result, userSettings.settings, 'Settings were saved');
    assert.end();
  })
  .catch(function (err) {
    return new Error(err.toString());
  });
});


test('model/userSettings: UserSettings object createSettings method should save key', function (assert) {
  var userSettings = UserSettings.userSettingsFactory('user7', settings1);
  logger.debug('TEST saveSettings settings are ', userSettings.settings);
  userSettings.createSettings()
  .then(function (reply) {
    logger.debug('TEST debug savesettings reply is ', reply);
    return db.sismemberProxy(keyGen.userSettingsSetKey(), keyGen.userSettingsKey(userSettings));
  })
  .then(function (reply) {
    logger.debug('TEST debug sismember reply is ', reply);
    assert.equal(reply, 1, 'Key was saved');
    assert.end();
  })
  .catch(function (err) {
    return new Error(err.toString());
  });
});

test('models/userSettings: UserSettings object setSettings method sets the object settings', function (assert) {
  var userSettings = UserSettings.userSettingsFactory(user1, settings1);
  var initialSettings = userSettings.settings;
  // Replace settings
  userSettings.setSettings(settings3);
  assert.deepEqual(userSettings.settings, settings3, 'Object has new settings value');
  // Change just two of the settings
  userSettings.setSettings(settings4);
  assert.notOk(userSettings.settings.anonymize, 'New setting was applied');
  assert.ok(userSettings.settings.rpcDebug, 'New setting was applied');
  assert.notOk(userSettings.settings.rpcVerbose, 'Unchanged setting was not updated');
  assert.equal(userSettings.settings.cifbulkQueue, 'cifbulk_v2', 'Unchanged setting was not updated');
  assert.end();
});

test('models/userSettings: UserSettings object getSettings method returns the object settings', function (assert) {
  var userSettings = UserSettings.userSettingsFactory(user1, settings1);
  // Get settings directly
  var currentSettings = userSettings.settings;
  // Now get via method
  var newSettings = userSettings.getSettings();
  assert.deepEqual(newSettings, currentSettings, 'Settings were returned');
  assert.end();
});

test('models/userSettings: UserSettings object getUser method gets the object user', function (assert) {
  var userSettings = UserSettings.userSettingsFactory(user1, settings1);
  var newUser = userSettings.getUser();
  assert.equal(newUser, user1, 'User was returned');
  assert.end();
});

test('models/userSettings: UserSettings object retrieveSettings method gets the settings from db', function (assert) {
  var userSettings = UserSettings.userSettingsFactory('user8', settings1);
  // Save the settings
  userSettings.createSettings()
  .then(function (reply) {
    return userSettings.retrieveSettings();
  })
  .then(function (reply) {
    logger.debug('TEST retrieveSettings reply from retrieve', reply);
    var result = convertBoolean(reply);
    assert.deepEqual(result, userSettings.settings, 'Object retrieveSettings method returned the settings');
    assert.end();
  })
  .catch(function (err) {
    return new Error(err.toString());
  });
});

test('models/userSettings: getUserSettings static method returns UserSettings object if user has been saved', function(assert) {
  var userSettings = UserSettings.userSettingsFactory('user9', settings1);
  // Save the settings
  userSettings.createSettings()
  .then(function (reply) {
    return UserSettings.getUserSettings('user9');
  })
  .then(function (reply) {
    logger.debug('TEST getUserSettings reply', reply);
    assert.equal(typeof (reply.getSettings), 'function', 'Object should have getSettings function');
    assert.equal(typeof (reply.saveSettings), 'function', 'Object should have saveSettings function');
    assert.ok(reply.hasOwnProperty('settings'), 'Object should have settings property');
    assert.ok(reply.hasOwnProperty('user'), 'Object should have user property');
    assert.equal(reply.user, 'user9');
    assert.deepEqual(reply.settings, userSettings.settings);
    assert.end();
  })
  .catch(function (err) {
    return new Error(err.toString());
  });
});

// if (config.testWithRedis) {
  test('models/fileData.js: Finished', function (assert) {
    logger.debug('Quitting redis');
    client.flushdb(function (reply) {
      logger.debug('flushdb reply ', reply);
      client.quit(function (err, reply) {
        logger.debug('quit reply ', reply);
        assert.end();
      });
    });
  });
// }
