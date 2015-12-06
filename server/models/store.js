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
        return new Error('Error parsing json. ' + err.toString());
      }
    })
    .catch(function (err) {
      return new Error('Error from redis. ' + err.toString());
    });
  };

  var existsInSet = function exists(item, setKey) {
    var sorted,
        promise;
    return client.typeAsync(setKey)
    .then(function (reply) {
      console.log('reply from type', reply, item, setKey);
      if (reply !== setType && reply !== sortedSetType) {
        return new Error ('existsInSet can only be called for sets and sorted sets');
      }
      sorted = (reply === sortedSetType);
      console.log('sorted is ', sorted);
      promise = sorted ? client.zrankAsync(setKey, item) : client.sismemberAsync(setKey, item);
      return promise;
    })
    .then(function (reply) {
      console.log('reply from promise', reply);
      var notExist = sorted ? null : 0;
      return reply === notExist ? false : true;
    })
    .catch(function (err) {
      return new Error(err.toString());
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

  // var addKeyToSet = function addKeyToSet(key, setKey) {
  //   return client.zaddAsync(setKey, timestamp(), key);
  // };

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
      return new Error('Error from redis. ' + err.toString());
    });
  };

  // list all keys in a sorted set
  var listKeys = function listKeys(setKey) {
    return client.zrangeAsync(setKey, 0, -1);
  };

  // keyArray: array of keys
  // sorted - true for sorted sets, false for regular sets
  var getKeysInSets = function listKeysInSets(keyArray) {
    var promises = [];
    _.forEach(keyArray, function (value, index) {
      client.typeAsync(setKey)
      .then(function (reply) {

      })
      if (sorted) {
        promises.push(client.zrangeAsync(value, 0, -1));
      } else {
        promises.push(client.smembersAsync(value));
      }
    });
    return q.all(promises);
  };

  var unionKeys = function unionKeys(setKeyArray, sorted) {
    if (!sorted) {
      return client.sunionAsync(setKeyArray);
    } else {
      return getKeysInSets(setKeyArray, sorted)
      .then(function (reply) {
        return _.union.apply(_, reply);
      })
      .catch(function (err) {
        return new Error ('intersectKeys ', err.toString());
      });
    }
  };

  // Return array of items that are found in all keys in the input array.
  // Redis sortedSet or set
  var intersectKeys = function intersectKeys(setKeyArray, sorted) {
    if (!sorted) {
      return client.sinterAsync.apply(client, setKeyArray);
    } else {
      return getKeysInSets(setKeyArray, sorted)
      .then(function (reply) {
        return _.intersection.apply(_, reply);
        // return _.intersection(reply);
      })
      .catch(function (err) {
        return new Error ('intersectKeys ', err.toString());
      });
    }
  };

  // item is an array. Removes from a set
  var removeItem = function removeItem(key, item) {
    return client.sremAsync(key, item);
  };

  store.getMetadata = getMetadata;
  store.setMetadata = setMetadata;
  store.setData = setData;
  store.getData = getData;
  store.existsInSet = existsInSet;
  store.incrCounter = incrCounter;
  store.incrementKey = incrementKey;
  store.listKeys = listKeys;
  store.addKeyToSet = addKeyToSet;
  store.addItem = addItem;
  store.unionKeys = unionKeys;
  store.intersectKeys = intersectKeys;

  return store;
};
