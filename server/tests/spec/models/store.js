'use strict';

var test = require('tape-catch');
var bluebird = require('bluebird');
var redis = require('redis');
var q = require('q');

var client = bluebird.promisifyAll(redis.createClient());
bluebird.promisifyAll(client.multi());
process.env.NODE_DEBUG = redis;
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
var sortedSetKey1 = 'test:set1';
var sortedSetKey2 = 'test:set2';
var sortedSetKey3 = 'test:set3';
var sortedSetKey4 = 'test:set4';
var dataKey1 = 'test:data1';
var dataKey2 = 'test:data2';
var dataKey3 = 'test:data3';
var dataKey4 = 'test:data4';
var setKey1 = 'test:setdata1';
var setKey2 = 'test:setdata2';
var setKey3 = 'test:setdata3';
var setKey4 = 'test:setdata4';
var nonExistingKey1 = 'not:here1';
var okResult = 'OK';

var setupSortedSets = function setupSortedSets() {
  return q.all([client.zaddAsync(sortedSetKey1, 1, dataKey1, 2, dataKey2),
    client.zaddAsync(sortedSetKey2, 1, dataKey2, 2, dataKey3),
    client.zaddAsync(sortedSetKey3, 4, dataKey3, 5, dataKey4),
    client.zaddAsync(sortedSetKey4, 1, dataKey1)
  ]);
};

var setupSets = function setupSets() {
  return q.all([client.saddAsync(setKey1, dataKey1, dataKey2),
    client.saddAsync(setKey2, dataKey2, dataKey3),
    client.saddAsync(setKey3, dataKey3, dataKey4),
    client.saddAsync(setKey4, dataKey1)
  ]);
};

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
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: Can retrieve saved metadata', function (assert) {
  // First save the metadata
  store.setMetadata(metaKey, meta1)
  .then(function (reply) {
    // Now retrieve it
    return store.getMetadata(metaKey);
  })
  .then(function (reply) {
    assert.deepEqual(reply, meta1);
    return client.flushdbAsync();
  })
  .then(function (reply) {
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
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: Can retrieve saved data', function (assert) {
  q.all([
    store.setData(dataKey1, jsonData1),
    store.setData(dataKey2, stringData1)
  ])
  .then(function () {
    return store.getData(dataKey1);
  })
  .then(function (reply) {
    assert.deepEqual(reply, jsonData1, 'Should return correct json data');
    return store.getData(dataKey2);
  })
  .then(function (reply) {
    assert.equal(reply, stringData1, 'Should return correct string data');
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: Can add key to a sorted set of keys', function (assert) {
  store.addKeyToSet(dataKey1, sortedSetKey1)
  .then(function (reply) {
    assert.equal(reply, 1);
    return store.addKeyToSet (dataKey2, sortedSetKey1);
  })
  .then(function (reply) {
    return client.zrangeAsync(sortedSetKey1, 0, -1);
  })
  .then(function (reply) {
    assert.equal(reply.length, 2, 'Two keys now in set');
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: Can add items to sets', function (assert) {
  store.addItem(dataKey1, setKey1)
  .then (function (reply) {
    assert.equal(reply, 1, 'Added one item to the set');
    return store.addItem([dataKey2, dataKey3], setKey1);
  })
  .then (function (reply) {
    assert.equal(reply, 2, 'Added two more items to the set');
    return store.addItem(dataKey2, setKey1);
  })
  .then (function (reply) {
    assert.equal(reply, 0, 'Adding an existing item returns 0');
    return client.smembersAsync(setKey1);
  })
  .then (function (reply) {
    assert.equal(reply.length, 3, 'Set now has 3 members');
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: Can add items to sorted sets', function (assert) {
  store.addItem(dataKey1, sortedSetKey1, 0)
  .then (function (reply) {
    assert.equal(reply, 1, 'Added one item to the set');
    return store.addItem([dataKey2, dataKey3], sortedSetKey1, 1);
  })
  .then (function (reply) {
    assert.equal(reply, 2, 'Added two more items to the set');
    return store.addItem(dataKey2, sortedSetKey1, 2);
  })
  .then (function (reply) {
    assert.equal(reply, 0, 'Adding an existing item returns 0');
    return client.zrangeAsync(sortedSetKey1, 0, -1);
  })
  .then (function (reply) {
    assert.equal(reply.length, 3, 'Set now has 3 members');
    return client.zrangeAsync(sortedSetKey1, 0, -1, 'WITHSCORES')
  })
  .then(function (reply) {
    console.log(reply);
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: existsInSet returns existence of item in a sorted set', function (assert) {
  setupSortedSets()
  .then(function (reply) {
    return store.existsInSet(dataKey1, sortedSetKey1);
  })
  .then(function (reply) {
    assert.ok(reply, 'Returns true when key exists');
    return store.existsInSet(dataKey3, sortedSetKey1);
  })
  .then(function (reply) {
    assert.notOk(reply, 'Returns false when key does not exist');
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: existsInSet returns existence of key in a set', function (assert) {
  setupSets()
  .then(function (reply) {
    return store.existsInSet(dataKey1, setKey1);
  })
  .then(function (reply) {
    assert.ok(reply, 'Returns true when key exists');
    return store.existsInSet(dataKey3, setKey1);
  })
  .then(function (reply) {
    assert.notOk(reply, 'Returns false when key does not exist');
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: existsInSet returns Error if set is not set or sortedSet', function (assert) {
  store.setData(dataKey1, jsonData1)
  .then(function (reply) {
    assert.throws(store.existsInSet(jsonData1, dataKey1));
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: Should return members of a set of keys', function (assert) {
  store.listKeys(sortedSetKey1)
  .then(function (reply) {
    assert.equal(reply.length, 1, 'Set has one key');
    assert.equal(reply[0], dataKey1, 'Correct key is returned');
    return store.addKeyToSet(dataKey2, sortedSetKey1);
  })
  .then(function (reply) {
    return store.listKeys(sortedSetKey1);
  })
  .then(function (reply) {
    assert.equal(reply.length, 2, 'Set has two keys');
    assert.equal(reply[0], dataKey1, 'Correct key is returned');
    assert.equal(reply[1], dataKey2, 'Correct key is returned');
    return store.listKeys(sortedSetKey2);
  })
  .then(function (reply) {
    assert.equal(reply.length, 0, 'Empty set returns empty array');
    return client.flushdbAsync();
  })
  .then(function (reply) {
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
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: intersectKeys should return intersection of keys in sorted sets', function (assert) {
  setupSortedSets()
  .then(function(reply) {
    return store.intersectKeys([sortedSetKey1, sortedSetKey2, sortedSetKey3], true);
  })
  .then(function (reply) {
    assert.deepEqual(reply, [], 'No keys in all sets');
    return store.intersectKeys([sortedSetKey1, sortedSetKey2], true);
  })
  .then(function (reply) {
    assert.deepEqual(reply, [dataKey2]);
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: intersectKeys should return intersection of keys in sets', function (assert) {
  setupSets()
  .then(function(reply) {
    return store.intersectKeys([setKey1, setKey2, setKey3], false);
  })
  .then(function (reply) {
    assert.deepEqual(reply, [], 'No keys in all sets');
    return store.intersectKeys([setKey1, setKey2], false);
  })
  .then(function (reply) {
    assert.deepEqual(reply, [dataKey2]);
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: unionKeys should return union of keys in sorted sets', function (assert) {
  setupSortedSets()
  .then(function(reply) {
    return store.unionKeys([sortedSetKey1, sortedSetKey2, sortedSetKey3], true);
  })
  .then(function (reply) {
    assert.deepEqual(reply, [dataKey1, dataKey2, dataKey3, dataKey4], 'Union contains one of each key');
    return store.unionKeys([sortedSetKey1], true);
  })
  .then(function (reply) {
    assert.deepEqual(reply, [dataKey1, dataKey2], 'Union of self contains correct keys');
    return store.unionKeys([sortedSetKey1, 'bob:bob'], true);
  })
  .then(function (reply) {
    assert.deepEqual(reply, [dataKey1, dataKey2], 'Union of set and non-existing set contains correct keys');
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: unionKeys should return union of keys in sets', function (assert) {
  setupSets()
  .then(function(reply) {
    return store.unionKeys([setKey1, setKey2, setKey3], false);
  })
  .then(function (reply) {
    // Won't be ordered so sort result
    assert.deepEqual(reply.sort(), [dataKey1, dataKey2, dataKey3, dataKey4], 'Union contains one of each key');
    return store.unionKeys([setKey1], false);
  })
  .then(function (reply) {
    assert.deepEqual(reply.sort(), [dataKey1, dataKey2], 'Union of self contains correct keys');
    return store.unionKeys([setKey1, 'bob:bob'], false);
  })
  .then(function (reply) {
    assert.deepEqual(reply.sort(), [dataKey1, dataKey2], 'Union of set and non-existing set contains correct keys');
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: Finished', function (assert) {
  // client.flushdbAsync()
  setupSets()
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
