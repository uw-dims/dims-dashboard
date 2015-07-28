'use strict'

var test = require('tape-catch');
var _ = require('lodash-compat');
var logger = require('../../../utils/logger');
var keyGen = require('../../../models/keyGen');

// Mock ticket and topic objects
// Just properties - don't need functions
var ticketConfig = {
  num: 5,
  creator: 'user1',
  type: 'data',
  createdTime: 1437828843121,
  open: true
};
var ticket1 = _.extend({}, ticketConfig);
var topicConfig = {
  parent: ticket1,
  type: 'data',
  name: 'topic1',
  dataType: 'hash'
};
var topic1 = _.extend({}, topicConfig);
var ticketKey1 = 'ticket:5';
var topicListKey1 = 'ticket:5.__topics';
var topicCounterKey1 = 'ticket:5:topic1.__counter';
var topicKey1 = 'ticket:5:data:topic1';
var topicTimestampKey = 'ticket:5:data:topic1.__timestamp';

var userObject = {
  user: 'user1',
  settings: {
    setting1: 'setting1',
    setting2: 'setting2'
  }
};
var fileObject1 = {
  creator: 'user1',
  description: 'description1',
  path: 'boxes',
  global: true,
  name: 'main.txt'
};
var fileObject2 = {
  creator: 'user1',
  description: 'description2',
  path: 'cif:test1',
  global: false,
  name: 'data.txt'
};
var fileKey1 = 'file:global:boxes:main.txt';
var fileKey2 = 'file:user1:cif:test1:data.txt';
var fileSetKey1 = 'file:global.__files';
var fileSetKey2 = 'file:user1.__files';
var fileMetaKey1 = 'file:global:boxes:main.txt.__meta';
var fileMetaKey2 = 'file:user1:cif:test1:data.txt.__meta';

var userSettingsKey1 = 'userSetting:user1';
var userSettingsSetKey1 = 'userSettings';

test('models/keyGen.js: keyGen should return keys for tickets and topics', function (assert) {
  assert.equal(keyGen.ticketKey(ticket1), ticketKey1, 'Returns correct ticket key');
  assert.equal(keyGen.topicListKey(ticket1), topicListKey1, 'Returns correct ticket list key');
  assert.equal(keyGen.topicKey(topic1), topicKey1, 'Returns correct topic key');
  assert.equal(keyGen.topicTimestampKey(topic1), topicTimestampKey, 'Returns correct topic timestamp key');
  assert.end();
});

test('models/keyGen.js: keyGen should return keys for files', function (assert) {
  assert.equal(keyGen.fileKey(fileObject1), fileKey1);
  assert.equal(keyGen.fileKey(fileObject2), fileKey2);
  assert.equal(keyGen.fileSetKey(fileObject1), fileSetKey1);
  assert.equal(keyGen.fileSetKey(fileObject2), fileSetKey2);
  assert.equal(keyGen.fileMetaKey(fileObject1), fileMetaKey1);
  assert.equal(keyGen.fileMetaKey(fileObject2), fileMetaKey2);
  assert.end();
});

test('models/keyGen.js: keyGen should return keys for user settings', function (assert) {
  assert.equal(keyGen.userSettingsKey(userObject), userSettingsKey1);
  assert.equal(keyGen.userSettingsSetKey(), userSettingsSetKey1);
  assert.end();
});


