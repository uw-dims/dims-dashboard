/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
'use strict';

var test = require('tape-catch');
var _ = require('lodash-compat');
// var logger = require('../../../utils/logger')(module);
var keyGen = require('../../../models/keyGen');

// Mock ticket and topic objects
// Just properties - don't need functions
var ticketConfig = {
  metadata: {
    num: 5,
    creator: 'user1',
    type: 'analysis',
    createdTime: 1437828843121,
    open: true
  }
};
var ticket1 = _.extend({}, ticketConfig);
var topicConfig = {
  metadata: {
    parent: ticket1.metadata,
    type: 'analysis',
    name: 'topic1',
    datatype: 'hash',
    num: 4,
    keyname: 'topic'
  }
};

var topic1 = _.extend({}, topicConfig);
console.log('ticket1', ticket1);
console.log('topic1', topic1);
var user1 = 'user1';
var ticketKey1 = 'dims:ticket:analysis:5';
var ticketCounterKey1 = 'dims:ticket.__counter';
var ticketSetKey1 = 'dims:ticket.__keys';
var ticketOwnedUser1 = 'dims:ticket.__owner.__user1';
var ticketSubbedByUser1 = 'dims:ticket.__subscriptions.__user1';
var ticketUsersSubbedTo = 'dims:ticket:analysis:5.__subscribers';
var ticketTypeSet = 'dims:ticket.__type.__analysis';
var ticketsOpen = 'dims:ticket.__open';
var ticketsClosed = 'dims:ticket.__closed';
var topicSetKey1 = 'dims:ticket:analysis:5.__topics';
var topicKey1 = 'dims:ticket:analysis:5:topic:4';
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
  assert.equal(keyGen.ticketKey(ticket1.metadata), ticketKey1, 'Returns correct ticket key');
  assert.equal(keyGen.ticketSetKey(), ticketSetKey1, 'Returns correct ticket set key');
  assert.equal(keyGen.ticketCounterKey(), ticketCounterKey1, 'Returns correct ticket counter key');
  assert.equal(keyGen.ticketOwnerKey(user1), ticketOwnedUser1, 'Returns correct key to tickets owned by this user, user input');
  assert.equal(keyGen.ticketSubscriptionsKey(user1), ticketSubbedByUser1, 'Returns correct key to ticket subscriptions for this user with user input');
  assert.equal(keyGen.ticketSubscribersKey(ticket1.metadata), ticketUsersSubbedTo, 'Returns correct key to users subscribed to this ticket');
  assert.equal(keyGen.ticketTypeKey(ticket1.metadata.type), ticketTypeSet, 'Returns correct key to set of tickets for a type, ticket input');
  assert.equal(keyGen.ticketTypeKey('analysis'), ticketTypeSet, 'Returns correct key to set of tickets for a type, type input');
  assert.equal(keyGen.ticketOpenKey(), ticketsOpen, 'Returns correct key to set of open tickets');
  assert.equal(keyGen.ticketClosedKey(), ticketsClosed, 'Returns correct key to set of closed tickets');
  assert.equal(keyGen.topicSetKey(topic1.metadata), topicSetKey1, 'Returns correct key to list of topics for this ticket');
  assert.equal(keyGen.topicKey(topic1.metadata), topicKey1, 'Returns correct topic key');

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


