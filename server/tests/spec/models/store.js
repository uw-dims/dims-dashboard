'use strict';

var test = require('tape-catch');
var bluebird = require('bluebird');
var redis = require('redis');

var client = bluebird.promisifyAll(redis.createClient());
bluebird.promisifyAll(client.multi());
client.selectAsync(10).then (function (reply) {
})
.catch(function (err) {
  console.error(err.toString());
});

// module we're testing
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
var setKey1 = 'test:set1';
var setKey2 = 'test:set2';
var dataKey1 = 'test:data1';
var dataKey2 = 'test:data2';
var nonExistingKey1 = 'not:here1';
var okResult = 'OK';

var failOnError = function (err, assert) {
  assert.fail(err);
  assert.end();
};

// Create a timestamp, UTC, milliseconds from epoch
var timestamp = function () {
  var now = new Date().getTime();
  return now;
};

test('models/store.js: Can save metadata', function (assert) {
  store.setMetadata(metaKey, meta1)
  .then(function (reply) {
    assert.equal(reply, okResult, 'Should return ok when saving data');
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: Can retrieve saved metadata', function (assert) {
  store.getMetadata(metaKey)
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

test('models/store.js: Can add key to a set of keys', function (assert) {
  store.addKeyToSet(dataKey1, setKey1)
  .then(function (reply) {
    assert.equal(reply, 1);
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: existsInSet returns existence of key in a set', function (assert) {
  store.existsInSet(dataKey1, setKey1)
  .then(function (reply) {
    assert.ok(reply, 'Returns true when key exists');
    return store.existsInSet(nonExistingKey1, setKey1);
  })
  .then(function (reply) {
    assert.notOk(reply, 'Returns false when key does not exist');
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: Should return members of a set of keys', function (assert) {
  store.listKeys(setKey1)
  .then(function (reply) {
    assert.equal(reply.length, 1, 'Set has one key');
    assert.equal(reply[0], dataKey1, 'Correct key is returned');
    return store.addKeyToSet(dataKey2, setKey1);
  })
  .then(function (reply) {
    return store.listKeys(setKey1);
  })
  .then(function (reply) {
    assert.equal(reply.length, 2, 'Set has two keys');
    assert.equal(reply[0], dataKey1, 'Correct key is returned');
    assert.equal(reply[1], dataKey2, 'Correct key is returned');
    return store.listKeys(setKey2);
  })
  .then(function (reply) {
    assert.equal(reply.length, 0, 'Empty set returns empty array');
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
