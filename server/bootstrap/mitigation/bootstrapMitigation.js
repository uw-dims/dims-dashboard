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

// File: server/bootstrap/mitigaton/bootstrapMitigation.js

// Bootstrap initial data for mitigation demonstration

var _ = require('lodash-compat');
var moment = require('moment');
var path = require('path');
var q = require('q');
var fs = require('fs');

var ROOT_DIR = __dirname + '/../../';

var diContainer = require(path.join(ROOT_DIR, '/services/diContainer'))();
var bluebird = require('bluebird');
var redis = require('redis');

var client = bluebird.promisifyAll(redis.createClient());
bluebird.promisifyAll(client.multi());

diContainer.factory('anonService', require(path.join(ROOT_DIR, '/services/anonymize')));
diContainer.register('client', client);
diContainer.factory('Ticket', require(path.join(ROOT_DIR, '/models/ticket')));
diContainer.factory('Topic', require(path.join(ROOT_DIR, '/models/topic')));
diContainer.factory('UserSettings', require(path.join(ROOT_DIR, '/models/userSettings')));
diContainer.factory('UserModel', require(path.join(ROOT_DIR, '/models/user')));
diContainer.factory('Attributes', require(path.join(ROOT_DIR, '/models/attributes')));
diContainer.factory('mitigationService', require(path.join(ROOT_DIR, '/services/mitigation')));
diContainer.factory('store', require(path.join(ROOT_DIR, '/models/store')));
diContainer.register('Bookshelf', require(path.join(ROOT_DIR, '/utils/bookshelf')));

var mitigationService = diContainer.get('mitigationService');
var Bookshelf = diContainer.get('Bookshelf');

(function () {
  var bootstrapMitigation = {};

  //options is array of users to use for mitigation progress bootstrap
  exports.runBootstrap = bootstrapMitigation.runBootstrap = function (options) {

    var ticketKey;
    var ipPath = __dirname + '/demo_mitigation_ips.txt';
    // var user1Ips, user2Ips, user1Chunk, user2Chunk;
    var k = 30;
    var i = 0;
    var submitTime = moment().subtract(k + 1, 'days').format('x');
    var submitDisplayTime = moment().subtract(k + 2, 'days').format('L');
    var description = 'IPs needing mitigation. As you mitigate IPs, submit them here.';

    var tg = options[0];
    options = _.drop(options, 1);
    var user1 = options[1];
    var user2 = options[2];

    var getRandom = function getRandom(min, max) {
      // Note we multiply by 1 to make sure min is interpreted as number
      return Math.floor(Math.random() * (max - min + 1)) + (min * 1);
    };

    var ipData = fs.readFileSync(ipPath, {encoding: 'utf-8'});

    mitigationService.initiateMitigation(ipData, user1, tg, 'Action Needed: ' + submitDisplayTime + ' Compromised IPs', description, submitTime)
    .then(function (reply) {
      ticketKey = reply;
      console.log('bootstrapMitigation ticketKey', ticketKey);
      var promises = [];
      _.forEach(options, function (value) {
        console.log('bootstrapMitigation. Get ips for user ', value);
        promises.push(mitigationService.getUserIps(ticketKey, value));
      });
      return q.all(promises);
    })
    .then(function (reply) {
      var userIps = reply;
      console.log('userIps in reply are', userIps);
      var userData = [];
      var simStartTime = moment().subtract(k + 1, 'days').format('x');
      var simEndTime = moment().subtract(1, 'days').format('x');
      var chunkSize = 4;
      console.log('start and end time are ', simStartTime, simEndTime);
      _.forEach(options, function (value, index) {
        var userNumIps = userIps[index].length,
          currUser = value;
        console.log('num user Ips for %s is %s ', currUser, userNumIps);
        // What we will remediate per day (60%)
        var maxRemediate = Math.floor(6 * userNumIps / 10);
        console.log('maxRemediate is ', maxRemediate);
        // numRemediate = Math.floor((3 * userNumIps / 5) / maxDays);
        // console.log('numRemediate for this user is ', numRemediate);
        // start days out
        i = 0;
        var currLength = userNumIps;
        if (maxRemediate > chunkSize) {
          var currRemediate = getRandom(1, Math.floor(maxRemediate / chunkSize));
          while (currRemediate >= 1 && i < maxRemediate) {
            console.log('in while, currRemediate is ', currRemediate, 'i is ', i);
            var currIps = _.slice(userIps[index], i, i + currRemediate);
            userData.push({ticketKey: ticketKey, currUser: currUser, currIps: currIps, currTime: getRandom(simStartTime, simEndTime)});
            i = i + currRemediate;
            currLength = currLength - currRemediate;
            currRemediate = getRandom(1, Math.floor(maxRemediate / chunkSize));
          }
        }
        userData = _.sortBy(userData, 'currTime');
      });
      var lastPromise = userData.reduce(function (promise, config) {
        return promise.then(function () {
          return mitigationService.remediate(config.ticketKey, config.currUser, config.currIps, config.currTime);
        });
      }, q.resolve());
      return lastPromise;
      // return q.all(promises);
    })
    .then(function (reply) {
      console.log('reply from lastPromise ', reply);
      return mitigationService.getMitigated(ticketKey);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from getMitigatedData', reply);
      return client.quitAsync();
    })
    .then(function () {
      Bookshelf.knex.destroy(function (err, reply) {
        console.log(err, reply);
      });
    })
    .catch(function (err) {
      console.log(err);
    });

  //   mitigationService.initiateMitigation(ipPath, user1, 'Action Needed: ' + submitDisplayTime + ' Compromised IPs', description, submitTime)
  //   .then(function (reply) {
  //     ticketKey = reply;
  //     console.log('bootstrapMitigation ticketKey', ticketKey);
  //     return mitigationService.getUserIps(ticketKey, user1);
  //   })
  //   .then(function (reply) {
  //     console.log(reply);
  //     user1Ips = reply;
  //     return mitigationService.getUserIps(ticketKey, user2);
  //   })
  //   .then(function (reply) {
  //     console.log(reply);
  //     user2Ips = reply;
  //     user1Chunk = [
  //       _.slice(user1Ips, 0, 10),
  //       _.slice(user1Ips, 11, 15),
  //       _.slice(user1Ips, 16, 17),
  //       _.slice(user1Ips, 18, 19),
  //       _.slice(user1Ips, 20, 25)
  //     ];
  //     user2Chunk = [
  //       _.slice(user2Ips, 0, 2),
  //       _.slice(user2Ips, 3, 6),
  //       _.slice(user2Ips, 7, 10),
  //       _.slice(user2Ips, 11, 12),
  //       _.slice(user2Ips, 13, 17)
  //     ];
  //     var time = moment().subtract(k, 'days').format('x');
  //     console.log(user2Chunk);
  //     console.log('time will be ', time);
  //     return mitigationService.remediate(ticketKey, user1, user1Chunk[i], time);
  //   })
  //   .then(function (reply) {
  //     console.log('bootstrapMitigation. reply from remediate ', reply);
  //     k = k - 1;
  //     i = i + 1;
  //     var time = moment().subtract(k, 'days').format('x');
  //     console.log('time will be ', time);
  //     return mitigationService.remediate(ticketKey, user1, user1Chunk[i], time);
  //   })
  //   .then(function (reply) {
  //     console.log('bootstrapMitigation. reply from remediate ', reply);
  //     k = k - 1;
  //     i = i + 1;
  //     var time = moment().subtract(k, 'days').format('x');
  //     console.log('time will be ', time);
  //     return mitigationService.remediate(ticketKey, user1, user1Chunk[i], time);
  //   })
  //   .then(function (reply) {
  //     console.log('bootstrapMitigation. reply from remediate ', reply);
  //     k = k - 1;
  //     i = i + 1;
  //     var time = moment().subtract(k, 'days').format('x');
  //     console.log('time will be ', time);
  //     return mitigationService.remediate(ticketKey, user1, user1Chunk[i], time);
  //   })
  //   .then(function (reply) {
  //     console.log('bootstrapMitigation. reply from remediate ', reply);
  //     k = k - 1;
  //     i = i + 1;
  //     var time = moment().subtract(k, 'days').format('x');
  //     console.log('time will be ', time);
  //     return mitigationService.remediate(ticketKey, user1, user1Chunk[i], time);
  //   })
  //   .then(function (reply) {
  //     console.log('bootstrapMitigation. reply from remediate ', reply);
  //     k = k - 1;
  //     i = 0;
  //     var time = moment().subtract(k, 'days').format('x');
  //     console.log('time will be ', time);
  //     return mitigationService.remediate(ticketKey, user2, user2Chunk[i], time);
  //   })
  //   .then(function (reply) {
  //     console.log('bootstrapMitigation. reply from remediate ', reply);
  //     k = k - 1;
  //     i = i + 1;
  //     var time = moment().subtract(k, 'days').format('x');
  //     console.log('time will be ', time);
  //     return mitigationService.remediate(ticketKey, user2, user2Chunk[i], time);
  //   })
  //   .then(function (reply) {
  //     console.log('bootstrapMitigation. reply from remediate ', reply);
  //     k = k - 1;
  //     i = i + 1;
  //     var time = moment().subtract(k, 'days').format('x');
  //     console.log('time will be ', time);
  //     return mitigationService.remediate(ticketKey, user2, user2Chunk[i], time);
  //   })
  //   .then(function (reply) {
  //     console.log('bootstrapMitigation. reply from remediate ', reply);
  //     k = k - 1;
  //     i = i + 1;
  //     var time = moment().subtract(k, 'days').format('x');
  //     console.log('time will be ', time);
  //     return mitigationService.remediate(ticketKey, user2, user2Chunk[i], time);
  //   })
  //   .then(function (reply) {
  //     console.log('bootstrapMitigation. reply from remediate ', reply);
  //     k = k - 1;
  //     i = i + 1;
  //     var time = moment().subtract(k, 'days').format('x');
  //     console.log('time will be ', time);
  //     return mitigationService.remediate(ticketKey, user2, user2Chunk[i], time);
  //   })
  //   .then(function (reply) {
  //     console.log('bootstrapMitigation. reply from remediate ', reply);
  //     return mitigationService.getMitigated(ticketKey);
  //   })
  //   .then(function (reply) {
  //     console.log('bootstrapMitigation. reply from getMitigated', reply);
  //     return mitigationService.getMitigatedData(ticketKey);
  //   })
  //   .then(function (reply) {
  //     console.log('bootstrapMitigation. reply from getMitigatedData', reply);
  //   })
  //   .then(function (reply) {
  //     return client.quitAsync();
  //   })
  //   .then(function () {
  //     Bookshelf.knex.destroy(function (err, reply) {
  //       console.log(err, reply);
  //     });
  //   })
  //   .catch(function (err) {
  //     console.log(err);
  //   });
  };

  if (!module.parent) {
    bootstrapMitigation.runBootstrap(process.argv.slice(2));
  }

})();

