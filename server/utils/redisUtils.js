'use strict';
// These functions wrap the redis commands used by the application so
// they return promises

var config = require('../config');
var logger = require('./logger');
var q = require('q');
var client = require('./redisDB');
var dimsUtils = require('./util');

module.exports = function() {

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

// Get all data from redis for different datatypes
// hash, set, sorted set
// defaults to "get" operation if no datatype supplied
// Gets all data when operation supports returning multiple
// (as in all hash field-value pairs)
var getAllData = function(key, dataType) {
  logger.debug('utils/redisUtils.getAllData. key, dataType: ', key, dataType);
  var deferred = q.defer();
  if (dataType === 'hash') {
    logger.debug('utils/redisUtils.getAllData. hash');
    hgetall(key).then(function(reply) {
      logger.debug('utils/redisUtils.getAllData. hash reply: ', reply);
      deferred.resolve(reply);
    }).catch(function(err) {
      logger.error('redisUtils.getAllData.hgetall had an err returned from redis', err, reply);
      deferred.reject(err.toString());
    });

  } else if (dataType === 'set') {
    smembers(key).then(function(reply) {
      deferred.resolve(reply);
    }, function(err, reply) {
      logger.error('redisUtils.getAllData.smembers had an err returned from redis', err, reply);
      deferred.reject(err.toString());
    });

  } else if (dataType === 'zset') {
    zrange(key, 0, -1).then(function(reply) {
      deferred.resolve(reply);
    }, function(err, reply) {
      logger.error('redisUtils.getAllData.zrange had an err returned from redis', err, reply);
      deferred.reject(err.toString());
    });
  } else {
    get(key).then(function(reply) {
      deferred.resolve(reply);
    }, function(err, reply) {
      logger.error('redisUtils.getAllData.get had an err returned from redis', err, reply);
      deferred.reject(err.toString());
    });
  }
  return deferred.promise;
};

var setData = function(key, dataType, content, score) {
  var deferred = q.defer();
  if (dataType === 'hash') {
    hmset(key, content).then(function(reply) {
      deferred.resolve(reply);
    }, function(err, reply) {
      logger.error('redisUtils.setData.hmset had an err returned from redis', err, reply);
      deferred.reject(err.toString());
    });

  } else if (dataType === 'set') {
    sadd(key, content).then(function(reply) {
      deferred.resolve(reply);
    }, function(err, reply) {
      logger.error('redisUtils.setData.sadd had an err returned from redis', err, reply);
      deferred.reject(err.toString());
    });
  } else if (dataType === 'zset') {
    // Uses current time as the score if it is not supplied
    var itemScore = score || 0;
    if (itemScore === 0) {
      itemScore = dimsUtils.createTimestamp();
    };
    zadd(key, score, content).then(function(reply) {
      logger.error('redisUtils.setData.zadd had an err returned from redis', err, reply);
      deferred.resolve(reply);
    }, function(err, reply) {
      deferred.reject(err.toString());
    });
  } else {
    set(key, content).then(function(reply) {
      deferred.resolve(reply);
    }, function(err, reply) {
      logger.error('redisUtils.setData.get had an err returned from redis', err, reply);
      deferred.reject(err.toString());
    });
  }
  return deferred.promise;
};

  return {
    hmset: hmset,
    incr: incr,
    sadd: sadd,
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
    getAllData: getAllData,
    setData: setData
  };

};

