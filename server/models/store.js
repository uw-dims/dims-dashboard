'use strict';

var q = require('q');

module.exports = function Store(client) {
  var store = {};

  var getMetaData = function getMetaData(key) {
    // return q.ninvoke(client, 'hgetall', key);
    return client.hgetallAsync(key);
  };

  var setMetaData = function setMetaData(key, metaData) {
    // return q.ninvoke(client, 'hset', key, metaData);
    return client.hmsetAsync(key, metaData);
  };

  var setData = function setData(key, json) {
    var data = {
      data: json
    };
    var finalData = JSON.stringify(data);
    // return q.ninvoke(client, 'set', finalData);
    return client.setAsync(key, finalData);
  };

  var getData = function getData(key) {
    // return q.ninvoke(client, 'get', key)
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

  var listAssociatedKeys = function list(key) {
    // return q.ninvoke(client, 'zrange', 0, 1);
    return client.zrangeAsync(key, 0, -1);
  };

  store.getMetaData = getMetaData;
  store.setMetaData = setMetaData;
  store.setData = setData;
  store.getData = getData;
  store.incrCounter = incrCounter;
  store.incrementKey =
  store.listAssociatedKeys = listAssociatedKeys;

  return store;
};
