'use strict';

var test = require('tape-catch');
var _ = require('lodash-compat');
var logger = require('../../../utils/logger');
var keyGen = require('../../../models/keyGen');

// Mock ticket and topic objects
// Just properties - don't need functions
var ticketConfig = {
  num: 5,
  creator: 'user1',
  type: 'analysis',
  createdTime: 1437828843121,
  open: true
};
var ticket1 = _.extend({}, ticketConfig);
var topicConfig = {
  parent: ticket1,
  type: 'analysis',
  name: 'topic1',
  dataType: 'hash'
};
var topic1 = _.extend({}, topicConfig);
var user1 = 'user1';
var ticketKey1 = 'dims:ticket:5';
var ticketCounterKey1 = 'dims:ticket.__counter';
var ticketSetKey1 = 'dims:ticket.__keys';
var ticketOwnedUser1 = 'dims:ticket.__owner.__user1';
var ticketSubbedByUser1 = 'dims:ticket.__subscriptions.__user1';
var ticketUsersSubbedTo = 'dims:ticket:5.__subscribers';
var ticketTypeSet = 'dims:ticket.__type.__analysis';
var ticketsOpen = 'dims:ticket.__open';
var ticketsClosed = 'dims:ticket.__closed';
var topicSetKey1 = 'dims:ticket:5.__topics';
var topicKey1 = 'dims:ticket:5:analysis:topic1';
// var topicTimestampKey = 'dims:ticket:5:data:topic1.__timestamp';

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
var fileKey1 = 'dims:file:_global:boxes:main.txt';
var fileKey2 = 'dims:file:user1:cif:test1:data.txt';
var fileSetKey1 = 'dims:file:_global.__keys';
var fileSetKey2 = 'dims:file:user1.__keys';
var fileMetaKey1 = 'dims:file:_global:boxes:main.txt.__meta';
var fileMetaKey2 = 'dims:file:user1:cif:test1:data.txt.__meta';

var userSettingsKey1 = 'dims:userSetting:user1';
var userSettingsSetKey1 = 'dims:userSetting.__keys';

test('models/keyGen.js: keyGen should return keys for tickets and topics', function (assert) {
  assert.equal(keyGen.ticketKey(ticket1), ticketKey1, 'Returns correct ticket key');
  assert.equal(keyGen.ticketSetKey(), ticketSetKey1, 'Returns correct ticket set key');
  assert.equal(keyGen.ticketCounterKey(), ticketCounterKey1, 'Returns correct ticket counter key');
  assert.equal(keyGen.ticketOwnerKey(ticket1), ticketOwnedUser1, 'Returns correct key to tickets owned by this user, ticket input');
  assert.equal(keyGen.ticketOwnerKey(user1), ticketOwnedUser1, 'Returns correct key to tickets owned by this user, user input');
  assert.equal(keyGen.ticketSubscriptionsKey(user1), ticketSubbedByUser1, 'Returns correct key to ticket subscriptions for this user with user input');
  assert.equal(keyGen.ticketSubscribersKey(ticket1), ticketUsersSubbedTo, 'Returns correct key to users subscribed to this ticket');
  assert.equal(keyGen.ticketTypeKey(ticket1), ticketTypeSet, 'Returns correct key to set of tickets for a type, ticket input');
  assert.equal(keyGen.ticketTypeKey('analysis'), ticketTypeSet, 'Returns correct key to set of tickets for a type, type input');
  assert.equal(keyGen.ticketOpenKey(), ticketsOpen, 'Returns correct key to set of open tickets');
  assert.equal(keyGen.ticketClosedKey(), ticketsClosed, 'Returns correct key to set of closed tickets');
  assert.equal(keyGen.topicSetKey(ticket1), topicSetKey1, 'Returns correct key to list of topics for this ticket');
  assert.equal(keyGen.topicKey(topic1), topicKey1, 'Returns correct topic key');

  assert.end();
});

test('models/keyGen.js: keyGen should return keys for files', function (assert) {
  assert.equal(keyGen.fileKey(fileObject1), fileKey1, 'Returns correct file key');
  assert.equal(keyGen.fileKey(fileObject2), fileKey2, 'Returns correct file key');
  assert.equal(keyGen.fileSetKey(fileObject1), fileSetKey1, 'Returns correct file set key');
  assert.equal(keyGen.fileSetKey(fileObject2), fileSetKey2, 'Returns correct file set key');
  assert.equal(keyGen.fileMetaKey(fileObject1), fileMetaKey1, 'Returns correct file metadata key');
  assert.equal(keyGen.fileMetaKey(fileObject2), fileMetaKey2, 'Returns correct file metadata key');
  assert.end();
});

test('models/keyGen.js: keyGen should return keys for user settings', function (assert) {
  assert.equal(keyGen.userSettingsKey(userObject.user), userSettingsKey1);
  assert.equal(keyGen.userSettingsSetKey(), userSettingsSetKey1);
  assert.end();
});


