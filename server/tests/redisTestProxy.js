'use strict';

// This will proxy some of the regular redisProxy methods so they work with
// the Redis mock used for testing (redis-js) since a few of the interfaces
// are different.

var logger = require('../utils/logger');
var q = require('q');
var _ = require('lodash-compat');
var dimsUtils = require('../utils/util');
var config = require('../config/config');

module.exports = function redisTestProxy(redisProxy) {

  // var supportedTypes = config.defaultRedisTypes;

  var hmset = function (key, hashObject) {
    logger.debug('TEST redisProxy: hmset: key, hashObject ', key, hashObject);
    var args = [];
    for (var prop in hashObject) {
      args.push(prop);
      args.push(hashObject[prop]);
    }
    redisProxy.hmset(key, args);
  };

  var hmsetProxy = function (key, hashObject) {
    logger.debug('TEST redisProxy: hmset: key, hashObject ', key, hashObject);
    var args = [];
    for (var prop in hashObject) {
      args.push(prop);
      args.push(hashObject[prop]);
    }
    return redisProxy.hmsetProxy(key, args);
  };


  // var hgetallProxy = function (key) {
  //   logger.debug('TEST redisProxy hgetall key is ', key);
  //   return redisProxy.hgetallProxy(key)
  //   .then(function (reply) {
  //     logger.debug('TEST redisProxy reply from hgetall ', reply);
  //     console.log(reply[0]);
  //     for (key in reply[0]) {
  //       if (reply[0].hasOwnProperty(key)) {
  //         console.log(key);
  //         console.log(reply[0][key]);
  //       }
  //     }
  //     var hashObject = {};
  //     var replyArray = reply[0].split(',');
  //     logger.debug('TEST redisProxy hgetall reply array is ');
  //     replyArray.forEach(function (val, i) {
  //       if (i % 2 === 1) {
  //         return;
  //       }
  //       hashObject[val] = replyArray[i + 1];
  //     });
  //     logger.debug('TEST redisProxy hgetall hashObject is ', hashObject);
  //     return hashObject;
  //   });
  // };

  // Returned methods
  return {
    hmset: hmset,
    hgetallProxy: redisProxy.hgetallProxy,
    hmsetProxy: hmsetProxy,
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
    multi: redisProxy.multi,
    incrProxy: redisProxy.incrProxy,
    saddProxy: redisProxy.saddProxy,
    rpushProxy: redisProxy.rpushProxy,
    setProxy: redisProxy.setProxy,
    getProxy: redisProxy.getProxy,
    lrangeProxy: redisProxy.lrangeProxy,
    sismemberProxy: redisProxy.sismemberProxy,
    smembersProxy: redisProxy.smembersProxy,
    zaddProxy: redisProxy.zaddProxy,
    zrangeProxy: redisProxy.zrangeProxy,
    zrankProxy: redisProxy.zrankProxy,
    zscoreProxy: redisProxy.zscoreProxy,
    zcountProxy: redisProxy.zcountProxy,
    typeProxy: redisProxy.typeProxy

  };
};

