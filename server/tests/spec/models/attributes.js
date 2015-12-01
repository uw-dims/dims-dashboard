'use strict';

var test = require('tape-catch');
var _ = require('lodash-compat');
// var logger = require('../../../utils/logger')(module);
// var config = require('../../../config/config');
// var keyGen = require('../../../models/keyGen');

// Enable service discovery for this test
var diContainer = require('../../../services/diContainer')();
var redis = require('redis');
var client = redis.createClient();
client.select(10, function (err, reply) {
  if (err) {
    console.error('test: redis client received error when selecting database ', err);
  } else {
    // logger.debug('test: redis has selected db', 10, 'reply is ', reply);
    // client.flushdb();
  }
});
diContainer.factory('db', require('../../../utils/redisProxy'));
diContainer.register('client', client);
diContainer.factory('Attributes', require('../../../models/attributes'));
var Attributes = diContainer.get('Attributes');
// var db = diContainer.get('db');

// TEST DATA
var user1 = 'bob';
var user2 = 'fred';
var expectedFactory = {
  'bob' : {
    'cidr': [],
    'domain': []
  }
};
var expectedEmpty = {
  'bob': {
    'cidr': [],
    'domain': []
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
  // logger.debug('Quitting redis');
  client.flushdb(function (reply) {
    // logger.debug('flushdb reply ', reply);
    client.quit(function (err, reply) {
      // logger.debug('quit reply ', reply);
      assert.end();
    });
  });
});

