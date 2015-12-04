'use strict';

module.exports = function Store(client) {
  var store = {};

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
        throw new Error('Error parsing json. ' + err.toString());
      }
    })
    .catch(function (err) {
      throw new Error('Error from redis. ' + err.toString());
    });
  };

  var existsInSet = function exists(key, setKey) {
    return client.zrankAsync(setKey, key)
    .then(function (reply) {
      return reply === null ? false : true;
    })
    .catch(function (err) {
      throw new Error('Error from redis. ' + err.toString());
    });
  };

  var addKeyToSet = function addKeyToSet(key, setKey) {
    return client.zaddAsync(setKey, timestamp(), key);
  };

  var incrCounter = function incrCounter(key) {
    // return q.ninvoke(client, 'incr', key);
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

  var listKeys = function list(setKey) {
    // return q.ninvoke(client, 'zrange', 0, 1);
    return client.zrangeAsync(setKey, 0, -1);
  };

  // item is an array
  var addItem = function addItem(key, item) {
    return client.saddAsync(key, item);
  };

  // item is an array
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

  return store;
};
