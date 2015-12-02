'use strict';

var test = require('tape-catch');
var bluebird = require('bluebird');

// Enable service discovery for this test
// var diContainer = require('../../../services/diContainer')();
var redis = require('redis');
// bluebird.promisifyAll(redis.RedisClient.prototype);
// bluebird.promisifyAll(redis.Multi.prototype);
var client = bluebird.promisifyAll(redis.createClient());
bluebird.promisifyAll(client.multi());
client.selectAsync(10).then (function (reply) {
})
.catch(function (err) {
  console.error(err.toString());
});
// var client = redi;s.createClient();
// client.select(10, function (err, reply) {
//   if (err) {
//     console.error('test: redis client received error when selecting database ', err);
//     throw new Error(err);
//   }
// });


var store = require('../../../models/store')(client);

// Test data

var meta1 = {
  type: 'mitigation',
  creator: 'user1'
};

var jsonData1 = {
  one: 'bob',
  two: 'fred',
  three: {
    sally: 'mine',
    nancy: ['1', '2']
  }
};

var stringData1 = 'Bob went home';

var counter = 0;

var counterKey = 'test:counter';
var metaKey = 'test:meta';
var associatedKey1 = 'test:meta:associated1';
var associatedKey2 = 'test:meta:associated2';
var dataKey1 = 'test:data1';
var dataKey2 = 'test:data2';
var okResult = 'OK';

var failOnError = function (err, assert) {
  assert.fail(err);
  assert.end();
};

test('models/store.js: Can save metadata', function (assert) {
  store.setMetaData(metaKey, meta1)
  .then(function (reply) {
    assert.equal(reply, okResult, 'Should return ok when saving data');
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: Can retrieve saved metadata', function (assert) {
  store.getMetaData(metaKey)
  .then(function (reply) {
    assert.deepEqual(reply, meta1);
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: Can save data', function (assert) {
  store.setData(dataKey1, jsonData1)
  .then(function (reply) {
    assert.equal(reply, okResult, 'Should return ok when saving json data');
    return store.setData(dataKey2, stringData1);
  })
  .then(function (reply) {
    assert.equal(reply, okResult, 'Should return ok when saving string data');
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: Can retrieve saved data', function (assert) {
  store.getData(dataKey1)
  .then(function (reply) {
    assert.deepEqual(reply, jsonData1, 'Should return correct json data');
    return store.getData(dataKey2);
  })
  .then(function (reply) {
    assert.equal(reply, stringData1, 'Should return correct string data');
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: Counter should increment', function (assert) {
  store.incrCounter(counterKey)
  .then(function (reply) {
    assert.equal(reply, 1, 'Counter should now be 1');
    return store.incrCounter(counterKey);
  })
  .then(function (reply) {
    assert.equal(reply, 2, 'Counter should now be 2');
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: Finished', function (assert) {
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
