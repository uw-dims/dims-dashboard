'use strict'

var test = require('tape');
var _ = require('lodash');

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

test('models/keyGen: keyGen should return keys for tickets and topics', function (assert) {
  assert.equal(keyGen.ticketKey(ticket1), ticketKey1, 'Returns correct ticket key');
  assert.equal(keyGen.topicListKey(ticket1), topicListKey1, 'Returns correct ticket list key');
  assert.equal(keyGen.topicKey(topic1), topicKey1, 'Returns correct topic key');
  assert.equal(keyGen.topicTimestampKey(topic1), topicTimestampKey, 'Returns correct topic timestamp key');
  assert.end();
});


