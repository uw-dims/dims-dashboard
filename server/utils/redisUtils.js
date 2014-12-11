'use strict';
// These functions wrap the redis commands used by the application so
// they return promises

var config = require('../config');
var logger = require('./logger');
var q = require('q');
var redisDB = require('./redisDB');
var dimsUtils = require('./util');

var hmset = q.nbind(redisDB.hmset, redisDB),
    incr = q.nbind(redisDB.incr, redisDB),
    sadd = q.nbind(redisDB.sadd, redisDB),
    rpush = q.nbind(redisDB.rpush, redisDB),
    set = q.nbind(redisDB.set, redisDB),
    get = q.nbind(redisDB.get, redisDB),
    lrange = q.nbind(redisDB.lrange, redisDB),
    sismember = q.nbind(redisDB.sismember, redisDB),
    smembers = q.nbind(redisDB.smembers, redisDB),
    hgetall = q.nbind(redisDB.hgetall, redisDB),
    zadd = q.nbind(redisDB.zadd, redisDB),
    zrange = q.nbind(redisDB.zrange, redisDB),
    zrank = q.nbind(redisDB.zrank, redisDB),
    type = q.nbind(redisDB.type, redisDB);

// Get all data from redis for different datatypes
// hash, set, sorted set
// defaults to "get" operation if no datatype supplied
// Gets all data when operation supports returning multiple
// (as in all hash field-value pairs)
var getAllData = function(key, dataType) {
  var deferred = q.defer();
  if (dataType === 'hash') {
    hgetall(key).then(function(reply) {
      deferred.resolve(reply);
    }, function(err, reply) {
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

var functions = {
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
  type: type,
  getAllData: getAllData,
  setData: setData
};

module.exports = functions;

