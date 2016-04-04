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

var _ = require('lodash-compat');
var q = require('q');

module.exports = function Store(client) {
  var store = {};

  var setType = 'set';
  var sortedSetType = 'zset';

  // Create a timestamp, UTC, milliseconds from epoch
  var timestamp = function () {
    var now = new Date().getTime();
    return now;
  };

  var getMetadata = function getMetadata(key) {
    return client.hgetallAsync(key);
  };

  var setMetadata = function setMetadata(key, metaData) {
    return client.hmsetAsync(key, metaData);
  };

  // json must be JSON?
  var setData = function setData(key, json) {
    var data = {
      data: json
    };
    var finalData = JSON.stringify(data);
    return client.setAsync(key, finalData);
  };

  var getData = function getData(key) {
    return client.getAsync(key)
    .then(function (reply) {
      try {
        var result = JSON.parse(reply);
        return result.data;
      }
      catch (err) {
        throw new Error('Error parsing json. ' + err.toString());
      }
    })
    .catch(function (err) {
      throw new Error('Error from redis. ' + err.toString());
    });
  };

  var deleteKey = function (key) {
    return client.delAsync(key);
  };

  var existsInSet = function exists(item, setKey) {
    var sorted,
        promise;
    return client.typeAsync(setKey)
    .then(function (reply) {
      if (reply !== setType && reply !== sortedSetType) {
        throw new Error ('existsInSet can only be called for sets and sorted sets');
      }
      sorted = (reply === sortedSetType);
      promise = sorted ? client.zrankAsync(setKey, item) : client.sismemberAsync(setKey, item);
      return promise;
    })
    .then(function (reply) {
      var notExist = sorted ? null : 0;
      return reply === notExist ? false : true;
    })
    .catch(function (err) {
      throw err;
    });

  };
  // options: item, setKey, score
  // with no score, item can be an array of items
  var addItem = function addItem(item, setKey, score) {
    var promise;
    if (score !== undefined) {
      promise = client.zaddAsync(setKey, score, item);
    } else {
      promise = client.saddAsync(setKey, item);
    }
    return promise;
  };

  // item can be an array. Removes from a set
  var removeItem = function removeItem(item, setKey) {
    var sorted;
    var args = [];
    if (typeof item === 'string') {
      item = [item];
    }
    args.push(setKey);
    args = _.union(args, item);
    return client.typeAsync(setKey)
    .then(function (reply) {
      if (reply !== setType && reply !== sortedSetType) {
        throw new Error ('listItems can only be called for sets and sorted sets');
      }
      sorted = (reply === sortedSetType);
      if (sorted) {
        return client.zremAsync.apply(client, args);
      } else {
        return client.sremAsync.apply(client, args);
      }
    })
    .catch(function (err) {
      throw err;
    });
  };

  var incrCounter = function incrCounter(key) {
    return client.incrAsync(key);
  };

  // Returns a key that needs an increment counter
  var incrementKey = function incrementKey(base, counterKey) {
    return client.incrAsync(counterKey)
    .then(function (reply) {
      return base + reply;
    })
    .catch(function (err) {
      throw new Error('Error from redis. ' + err.toString());
    });
  };

  // List all items in a set or sorted set
  var listItems = function listItems(key) {
    var sorted;
    // Get type
    return client.typeAsync(key)
    .then(function (reply) {
      if (reply !== setType && reply !== sortedSetType) {
        throw new Error ('listItems can only be called for sets and sorted sets');
      }
      sorted = (reply === sortedSetType);
      if (sorted) {
        return client.zrangeAsync(key, 0, -1);
      } else {
        return client.smembersAsync(key);
      }
    })
    .catch(function (err) {
      throw new Error(err.toString());
    });
  };

  var listItemsWithScores = function listItemsWithScores(key) {
    // Get type
    return client.typeAsync(key)
    .then(function (reply) {
      if (reply !== sortedSetType) {
        throw new Error ('listItemsWithScores can only be called on sorted sets');
      }
      return client.zrangeAsync(key, 0, -1, 'WITHSCORES');
    })
    .catch(function (err) {
      throw new Error(err.toString());
    });
  };

  // Get array of results from an array of sorted sets
  var getAllInSortedSets = function getAllInSortedSets(keyArray) {
    var promises = [];
    _.forEach(keyArray, function (value, index) {
      promises.push(client.zrangeAsync(value, 0, -1));
    });
    return q.all(promises);
  };

  var unionItems = function unionItems(setKeyArray) {
    var sorted;
    return client.typeAsync(setKeyArray[0])
    .then(function (reply) {
      if (reply !== setType && reply !== sortedSetType) {
        throw new Error ('unionKeys can only be called for sets and sorted sets');
      }
      sorted = (reply === sortedSetType);
      if (!sorted) {
        return client.sunionAsync(setKeyArray);
      } else {
        return getAllInSortedSets(setKeyArray)
        .then(function (reply) {
          return _.union.apply(_, reply);
        })
        .catch(function (err) {
          return err;
        });
      }
    })
    .catch(function (err) {
      throw err;
    });
  };

  // Return array of items that are found in all keys in the input array.
  // Redis sortedSet or set
  var intersectItems = function intersectItems(setKeyArray) {
    var sorted;
    return client.typeAsync(setKeyArray[0])
    .then(function (reply) {
      if (reply !== setType && reply !== sortedSetType) {
        throw new Error ('intersectItems can only be called for sets and sorted sets');
      }
      sorted = (reply === sortedSetType);
      if (!sorted) {
        return client.sinterAsync.apply(client, setKeyArray);
      } else {
        return getAllInSortedSets(setKeyArray)
        .then(function (reply) {
          return _.intersection.apply(_, reply);
        })
        .catch(function (err) {
          throw err;
        });
      }
    })
    .catch(function (err) {
      throw err;
    });
  };

  var countItems = function countItems(key) {
    return client.typeAsync(key)
    .then(function (reply) {
      if (reply !== setType && reply !== sortedSetType) {
        // keys don't exist for sets that have 0 members
        // so return 0;
        return q.fcall(function () {
          return 0;
        });
      }
      if (reply === sortedSetType) {
        return client.zcardAsync(key);
      } else {
        return client.scardAsync(key);
      }
    })
    .catch(function (err) {
      throw err;
    });
  };

  store.getMetadata = getMetadata;
  store.setMetadata = setMetadata;
  store.setData = setData;
  store.getData = getData;
  store.existsInSet = existsInSet;
  store.incrCounter = incrCounter;
  store.incrementKey = incrementKey;
  store.listItems = listItems;
  store.addItem = addItem;
  store.removeItem = removeItem;
  store.unionItems = unionItems;
  store.intersectItems = intersectItems;
  store.deleteKey = deleteKey;
  store.countItems = countItems;
  store.listItemsWithScores = listItemsWithScores;

  return store;
};
