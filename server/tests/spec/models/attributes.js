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
// var config = require('../../../config/config');
// var keyGen = require('../../../models/keyGen');

// Enable service discovery for this test
// var diContainer = require('../../../services/diContainer')();
var bluebird = require('bluebird');
var redis = require('redis');

var client = bluebird.promisifyAll(redis.createClient());
bluebird.promisifyAll(client.multi());
client.selectAsync(10).then (function (reply) {
})
.catch(function (err) {
  console.error(err.toString());
});

// diContainer.register('client', client);
// diContainer.factory('Attributes', require('../../../models/attributes'));
// var Attributes = diContainer.get('Attributes');
// var db = diContainer.get('db');
var Attributes = require('../../../models/attributes')(client);

// TEST DATA
var user1 = 'bob';
var user2 = 'fred';
var expectedFactory = {
  'bob' : {
    'cidr': [],
    'domain': [],
    'tlp': []
  }
};
var expectedEmpty = {
  'bob': {
    'cidr': [],
    'domain': [],
    'tlp': []
  }
};
var newAttributes1 = {
  'cidr': ['108.169.228.0/22','65.192.0.0/11','72.69.0.0/16','212.235.0.0/17'],
  'domain': ['example.com', 'prisem.washington.edu']
};

var newAttributes2 = {
  'cidr': ['116.252.0.0/15','117.21.0.0/16','119.200.0.0/13'],
  'domain': ['cnn.com']
};

test('models/attributes: attributesFactory should return created object', function (assert) {
  var attributes = Attributes.attributesFactory(user1);
  assert.deepEqual(attributes, expectedFactory, 'Factory created object correctly');
  assert.end();
});

test('models/attributes: getAttributes works when no attributes exist', function (assert) {
  var attributes = Attributes.attributesFactory(user1);
  attributes.getAttributes(user1)
  .then(function (reply) {
    assert.deepEqual(reply, expectedEmpty, 'Object with no attributes was returned');
    assert.end();
  }).catch(function (err) {
    return new Error(err.toString());
  });
});

test('models/attributes: updateAttributes should create attributes', function (assert) {
  var attributes = Attributes.attributesFactory(user1);
  attributes.updateAttributes(user1, newAttributes1)
  .then(function (reply) {
    return attributes.getAttributes(user1);
  })
  .then(function (reply) {
    assert.deepEqual(Object.keys(reply), [user1], 'Attributes key is user name');
    assert.deepEqual(reply[user1].cidr.sort(), newAttributes1.cidr.sort(), 'CIDR blocks returned');
    assert.deepEqual(reply[user1].domain.sort(), newAttributes1.domain.sort(), 'Domains returned');
    assert.end();
  }).catch(function (err) {
    return new Error(err.toString());
  });
});

test('models/attributes: getAllAttributes should return all attributes', function(assert) {
  var attributes = Attributes.attributesFactory(user2);
  attributes.updateAttributes(user1, newAttributes1)
  .then(function (reply) {
    return attributes.updateAttributes(user2, newAttributes2);
  })
  .then(function (reply) {
    return Attributes.getAllAttributes();
  })
  .then(function (reply) {
    assert.deepEqual(reply[user1].cidr.sort(), newAttributes1.cidr.sort(), 'User1 CIDR matches');
    assert.deepEqual(reply[user1].domain.sort(), newAttributes1.domain.sort(), 'User1 domain matches');
    assert.deepEqual(reply[user2].cidr.sort(), newAttributes2.cidr.sort(), 'User2 CIDR matches');
    assert.deepEqual(reply[user2].domain.sort(), newAttributes2.domain.sort(), 'User3 domain matches');
    assert.end();
  }).catch(function (err) {
    return new Error(err.toString());
  });
});

test('models/attributes.js: Finished', function (assert) {
  client.flushdbAsync()
  .then(function (reply) {
    return client.quitAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    console.error(err.toString());
    assert.end();
  });
});

