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
  console.log(err);
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
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: Can retrieve saved metadata', function (assert) {
  // First save the metadata
  store.setMetadata(metaKey, meta1)
  .then(function () {
    // Now retrieve it
    return store.getMetadata(metaKey);
  })
  .then(function (reply) {
    assert.deepEqual(reply, meta1);
    return client.flushdbAsync();
  })
  .then(function () {
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
  .then(function () {
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
    return store.addItem(dataKey2, sortedSetKey1, 1);
  })
  .then (function (reply) {
    assert.equal(reply, 1, 'Added one more item to the set');
    return store.addItem(dataKey2, sortedSetKey1, 1);
  })
  .then (function (reply) {
    assert.equal(reply, 0, 'Adding an existing item with same score returns 0');
    return store.addItem(dataKey2, sortedSetKey1, 2);
  })
  .then (function (reply) {
    assert.equal(reply, 0, 'Adding an existing item with different score returns 0');
    return client.zrangeAsync(sortedSetKey1, 0, -1);
  })
  .then (function (reply) {
    assert.equal(reply.length, 2, 'Set now has 2 members');
    return client.zrangeAsync(sortedSetKey1, 0, -1, 'WITHSCORES');
  })
  .then(function (reply) {
    // console.log(reply);
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: Can remove items from sets', function (assert) {
  setupSets()
  .then(function () {
    return store.removeItem(dataKey1, setKey1);
  })
  .then(function (reply) {
    assert.equals(reply, 1, 'Removed one item');
    return client.smembersAsync(setKey1);
  })
  .then(function (reply) {
    assert.deepEquals(reply, [dataKey2], 'Verified item was removed');
    return store.removeItem([dataKey2, dataKey3], setKey2);
  })
  .then(function (reply) {
    assert.equals(reply, 2, 'Removed two items');
    return client.smembersAsync(setKey2);
  })
  .then(function (reply) {
    assert.equals(reply.length, 0, 'Items were removed');
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: Can remove items from sorted sets', function (assert) {
  setupSortedSets()
  .then(function () {
    return store.removeItem(dataKey1, sortedSetKey1);
  })
  .then(function (reply) {
    assert.equals(reply, 1, 'Removed one item');
    return client.zrangeAsync(sortedSetKey1, 0, -1);
  })
  .then(function (reply) {
    assert.deepEquals(reply, [dataKey2], 'Verified item was removed');
    return store.removeItem([dataKey2, dataKey3], sortedSetKey2);
  })
  .then(function (reply) {
    assert.equals(reply, 2, 'Removed two items');
    return client.zrangeAsync(sortedSetKey2, 0, -1);
  })
  .then(function (reply) {
    assert.equals(reply.length, 0, 'Items were removed');
    return client.zremAsync(sortedSetKey3, dataKey3, dataKey4);
  })
  .then(function (reply) {
    // console.log(reply);
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
  .then(function () {
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
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: existsInSet returns existence of key in a set', function (assert) {
  setupSets()
  .then(function () {
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
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: existsInSet throws Error if set is not set or sortedSet', function (assert) {
  store.setData(dataKey1, jsonData1)
  .then(function () {
    return store.existsInSet(jsonData1, dataKey1);
  })
  .catch(function (err) {
    assert.ok(err instanceof Error, 'Error was thrown');
    client.flushdbAsync()
    .then(function () {
      assert.end();
    });
  });
});

test('models/store.js: listItems should return members of a set', function (assert) {
  setupSets()
  .then(function () {
    return setupSortedSets();
  })
  .then(function () {
    return store.listItems(sortedSetKey1);
  })
  .then(function (reply) {
    assert.equal(reply.length, 2, 'Returns two items from sorted set');
    assert.deepEqual(reply, [dataKey1, dataKey2], 'Returns correct items from sorted set');
    return store.listItems(setKey1);
  })
  .then(function (reply) {
    assert.equal(reply.length, 2, 'Returns two items from set');
    assert.deepEqual(reply.sort(), [dataKey1, dataKey2], 'Returns correct items from set');
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/store.js: listItems should throw error for invalid key', function (assert) {
  store.setData(dataKey1, jsonData1)
  .then(function () {
    return store.listItems(dataKey1);
  })
  .catch(function (err) {
    assert.ok(err instanceof Error, 'Error was thrown');
    client.flushdbAsync()
    .then(function () {
      assert.end();
    });
  });
});

test('models/store.js: listItems should throw error for non-existing key', function (assert) {
  return store.listItems('bob:bob')
  .catch(function (err) {
    assert.ok(err instanceof Error, 'Error was thrown');
    client.flushdbAsync()
    .then(function (reply) {
      assert.end();
    });
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

test('models/store.js: intersectItems should return intersection of items in sorted sets', function (assert) {
  setupSortedSets()
  .then(function (reply) {
    return store.intersectItems([sortedSetKey1, sortedSetKey2, sortedSetKey3]);
  })
  .then(function (reply) {
    assert.deepEqual(reply, [], 'No keys in all sets');
    return store.intersectItems([sortedSetKey1, sortedSetKey2]);
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

test('models/store.js: intersetItems should return intersection of keys in sets', function (assert) {
  setupSets()
  .then(function (reply) {
    return store.intersectItems([setKey1, setKey2, setKey3], false);
  })
  .then(function (reply) {
    assert.deepEqual(reply, [], 'No keys in all sets');
    return store.intersectItems([setKey1, setKey2], false);
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

test('models/store.js: unionItems should return union of keys in sorted sets', function (assert) {
  setupSortedSets()
  .then(function (reply) {
    return store.unionItems([sortedSetKey1, sortedSetKey2, sortedSetKey3], true);
  })
  .then(function (reply) {
    assert.deepEqual(reply, [dataKey1, dataKey2, dataKey3, dataKey4], 'Union contains one of each key');
    return store.unionItems([sortedSetKey1], true);
  })
  .then(function (reply) {
    assert.deepEqual(reply, [dataKey1, dataKey2], 'Union of self contains correct keys');
    return store.unionItems([sortedSetKey1, 'bob:bob'], true);
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

test('models/store.js: unionItems should return union of keys in sets', function (assert) {
  setupSets()
  .then(function (reply) {
    return store.unionItems([setKey1, setKey2, setKey3], false);
  })
  .then(function (reply) {
    // Won't be ordered so sort result
    assert.deepEqual(reply.sort(), [dataKey1, dataKey2, dataKey3, dataKey4], 'Union contains one of each key');
    return store.unionItems([setKey1], false);
  })
  .then(function (reply) {
    assert.deepEqual(reply.sort(), [dataKey1, dataKey2], 'Union of self contains correct keys');
    return store.unionItems([setKey1, 'bob:bob'], false);
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
