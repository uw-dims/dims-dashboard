'use strict';

// This will proxy some of the regular redisProxy methods so they work with
// the Redis mock used for testing (redis-js) since a few of the interfaces
// are different.

var logger = require('../utils/logger');
var q = require('q');
var _ = require('lodash-compat');
var dimsUtils = require('../utils/util');

module.exports = function redisTestProxy(redisProxy) {

  var hmset = function hmset(key, hashObject) {
    logger.debug('TEST redisProxy: hmset: key, hashObject ', key, hashObject);
    var args = [];
    for (var prop in hashObject) {
      args.push(prop);
      args.push(hashObject[prop]);
    }
    return redisProxy.hmset(key, args);
  };

  var hgetall = function hgetall(key) {
    logger.debug('TEST redisProxy hgetall key is ', key);
    return redisProxy.hgetall(key)
    .then(function (reply) {
      logger.debug('TEST redisProxy reply from hgetall ', reply);
      var hashObject = {};
      var replyArray = reply[0].split(',');
      replyArray.forEach(function (val, i) {
        if (i % 2 === 1) {
          return;
        }
        hashObject[val] = replyArray[i + 1];
      });
      logger.debug('TEST redisProxy hgetall hashObject is ', hashObject);
      return hashObject;
    });
  };

  var setData = function setData(key, dataType, content, score) {
    if (dataType === 'hash') {
      return hmset(key, content);
    } else if (dataType === 'set') {
      return redisProxy.sadd(key, content);
    } else if (dataType === 'zset') {
      // Uses current time as the score if it is not supplied
      var itemScore = score || 0;
      if (itemScore === 0) {
        itemScore = dimsUtils.createTimestamp();
      };
      return redisProxy.zadd(key, score, content);
    } else {
      return redisProxy.set(key, content)
    }
  };

  var getAllData = function getAllData(key, dataType) {
    if (dataType === 'hash') {
      return hgetall(key);
    } else if (dataType === 'set') {
      return redisProxy.smembers(key);
    } else if (dataType === 'zset') {
      return redisProxy.zrange(key, 0, -1);
    } else {
      return redisProxy.get(key);
    }
  };

  // Returned methods
  return {
    hmset: hmset,
    hgetall: hgetall,
    incr: redisProxy.incr,
    sadd: redisProxy.sadd,
    rpush: redisProxy.rpush,
    set: redisProxy.set,
    get: redisProxy.get,
    lrange: redisProxy.lrange,
    sismember: redisProxy.sismember,
    smembers: redisProxy.smembers,
    zadd: redisProxy.zadd,
    zrange: redisProxy.zrange,
    zrank: redisProxy.zrank,
    zscore: redisProxy.zscore,
    zcount: redisProxy.zcount,
    type: redisProxy.type,
    getAllData: getAllData,
    setData: setData
  };
};

