'use strict';
// This module proxies redis commands used by the application so
// they return promises. Combination of proxy and decorator pattern.

var logger = require('./logger');
var q = require('q');
var dimsUtils = require('./util');

module.exports = function redisProxy(client) {

  // client.set('testkey', 'bob', function (reply) {
  //   logger.debug('testkey reply is ', reply);
  //   client.get('testkey', function (reply) {
  //     logger.debug('testkey get reply is ', reply);
  //   });
  // });

  var hmset = q.nbind(client.hmset, client),
      incr = q.nbind(client.incr, client),
      sadd = q.nbind(client.sadd, client),
      rpush = q.nbind(client.rpush, client),
      set = q.nbind(client.set, client),
      get = q.nbind(client.get, client),
      lrange = q.nbind(client.lrange, client),
      sismember = q.nbind(client.sismember, client),
      smembers = q.nbind(client.smembers, client),
      hgetall = q.nbind(client.hgetall, client),
      zadd = q.nbind(client.zadd, client),
      zrange = q.nbind(client.zrange, client),
      zrank = q.nbind(client.zrank, client),
      zscore = q.nbind(client.zscore, client),
      zcount = q.nbind(client.zcount, client),
      type = q.nbind(client.type, client);

  // Only returning proxied methods plus added methods
  return {
    hmset: hmset,
    incr: incr,
    sadd: sadd,
    rpush: rpush,
    set: set,
    get: get,
    lrange: lrange,
    hgetall: hgetall,
    sismember: sismember,
    smembers: smembers,
    zadd: zadd,
    zrange: zrange,
    zrank: zrank,
    zscore: zscore,
    zcount: zcount,
    type: type,

    // Added methods
    getAllData: function (key, dataType) {
      if (dataType === 'hash') {
        return hgetall(key);
      } else if (dataType === 'set') {
        return smembers(key);
      } else if (dataType === 'zset') {
        return zrange(key, 0, -1);
      } else {
        return get(key);
      }
    },

    setData: function (key, dataType, content, score) {
      if (dataType === 'hash') {
        return hmset(key, content);
      } else if (dataType === 'set') {
        return sadd(key, content);
      } else if (dataType === 'zset') {
        // Uses current time as the score if it is not supplied
        var itemScore = score || 0;
        if (itemScore === 0) {
          itemScore = dimsUtils.createTimestamp();
        };
        return zadd(key, score, content);
      } else {
        return set(key, content)
      }
    }
  }
};
