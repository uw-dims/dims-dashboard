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

 // THIS IS BEING MADE OBSOLETE
 // REFACTOR ANY REMAINING FILES THAT USE IT AND THEN DELETE
 // WE NOW USE redisDB.js

'use strict';
// This module proxies redis commands so
// they return promises. Returns client so app can use proxied
// or original commands

var logger = require('./logger')(module);
var q = require('q');
var config = require('../config/config');
var supportedTypes = config.defaultRedisTypes;
var dimsUtils = require('./util.js');


module.exports = function redisProxy(client) {

  client.hmsetProxy = q.nbind(client.hmset, client);
  // client.hmsetProxy = q.nbind(client.hmset, client),
  client.incrProxy = q.nbind(client.incr, client);
  client.saddProxy = q.nbind(client.sadd, client);
  client.sremProxy = q.nbind(client.srem, client);
  client.rpushProxy = q.nbind(client.rpush, client);
  client.setProxy = q.nbind(client.set, client);
  client.getProxy = q.nbind(client.get, client);
  client.lrangeProxy = q.nbind(client.lrange, client);
  client.sismemberProxy = q.nbind(client.sismember, client);
  client.smembersProxy = q.nbind(client.smembers, client);
  client.hgetallProxy = q.nbind(client.hgetall, client);
  client.zaddProxy = q.nbind(client.zadd, client);
  client.zrangeProxy = q.nbind(client.zrange, client);
  client.zrankProxy = q.nbind(client.zrank, client);
  client.zscoreProxy = q.nbind(client.zscore, client);
  client.zcountProxy = q.nbind(client.zcount, client);
  client.typeProxy = q.nbind(client.type, client);
  client.scardProxy = q.nbind(client.scard, client);
  client.existsProxy = q.nbind(client.exists, client);
  // set - 'sortedSet' or 'set'
  // client.exists = function exists(key, set, dataType) {
  //   var doAction = {};
  //   doAction[supportedTypes.set] = function (key, set) {
  //     return client.zrankProxy(set, key)
  //     .then(function (reply) {
  //       return reply === null ? false : true;
  //     });
  //   };
  //   doAction[supportedTypes.sortedSet] = function (key, set) {
  //     return client.sismemberProxy(set, key)
  //     .then(function (reply) {
  //       return reply === 1 ? true : false;
  //     });
  //   };
  //   if (typeof doAction[dataType] !== 'function') {
  //     return new Error('Invalid data type was supplied: ', dataType);
  //   }
  //   return doAction[dataType];
  // };

  client.setData = function (key, dataType, content, score) {
    //logger.debug('setData detatype is ', dataType);
    //logger.debug('setData content is ', content);
    //logger.debug('setData key is ', key);
    var doAction = {};
    doAction[supportedTypes.hash] = function (key, content) {
      //logger.debug('redisproxy hash set', key, content);
      return client.hmsetProxy(key, content);
    };
    doAction[supportedTypes.set] =  function (key, content) {
      return client.saddProxy(key, content);
    };
    doAction[supportedTypes.sortedSet] =  function (key, content, score) {
      // Uses current time as the score if it is not supplied
      var itemScore = score || 0;
      if (itemScore === 0) {
        itemScore = dimsUtils.createTimestamp();
      }
      return client.zaddProxy(key, score, content);
    };
    doAction[supportedTypes.string] =  function (key, content) {
      //logger.debug('redisproxy hash set');
      return client.setProxy(key, content);
    };
    if (typeof doAction[dataType] !== 'function') {
      return new Error('Invalid data type was supplied: ', dataType);
    }
    //logger.debug('setData before return');
    return doAction[dataType](key, content, score);
  };

  // Method to get string data at a key, entire hash at a key,

  client.getData = function (key, dataType) {
    var doAction = {};
    doAction[supportedTypes.hash] = function (key) {
      return client.hgetallProxy(key);
    };
    doAction[supportedTypes.string] =  function (key) {
      return client.getProxy(key);
    };
    doAction[supportedTypes.set] =  function (key) {
      return client.smembersProxy(key);
    };
    doAction[supportedTypes.sortedSet] =  function (key) {
      return client.zrangeProxy(key, 0, -1, 'WITHSCORES');
    };
    if (typeof doAction[dataType] !== 'function') {
      return new Error('Invalid data type was supplied: ', dataType);
    }
    return doAction[dataType](key);
  };

  // client.hmsetProxy = hmsetProxy;

  return client;

};
