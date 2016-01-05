'use strict';

// File: server/bootstrap/mitigaton/bootstrapMitigation.js

// Bootstrap initial data for mitigation demonstration

var _ = require('lodash-compat');
var moment = require('moment');
var path = require('path');
var q = require('q');
var ROOT_DIR = __dirname + '/../../';

var keyGen = require(path.join(ROOT_DIR, '/models/keyGen'));

var diContainer = require(path.join(ROOT_DIR, '/services/diContainer'))();
// var client = redis.createClient();
var bluebird = require('bluebird');
var redis = require('redis');

var client = bluebird.promisifyAll(redis.createClient());
bluebird.promisifyAll(client.multi());

diContainer.factory('anonService', require(path.join(ROOT_DIR, '/services/anonymize')));
// diContainer.factory('db', require(path.join(ROOT_DIR, '/utils/redisProxy')));
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
    var ipPath = __dirname + '/mitigation_ips2.txt';
    var user1Ips, user2Ips, user1Chunk, user2Chunk;
    var k = 15;
    var i = 0;
    var submitTime = moment().subtract(k + 1, 'days').format('x');
    var submitDisplayTime = moment().subtract(k + 1, 'days').format('L');
    var user1 = options[0];
    var user2 = options[1];
    var description = 'IPs needing mitigation. As you mitigate IPs, submit them here.';

    var getRandom = function getRandom(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    };


    mitigationService.initiateMitigation(ipPath, user1, 'Action Needed: ' + submitDisplayTime + ' Compromised IPs', description, submitTime)
    .then(function (reply) {
      ticketKey = reply;
      console.log('bootstrapMitigation ticketKey', ticketKey);
      k = 20;
      var promises = [];
      _.forEach(options, function (value) {
        console.log('bootstrapMitigation. Get ips for user ', value);
        promises.push(mitigationService.getUserIps(ticketKey, value));
      });
      return q.all(promises);
    })
    .then(function (reply) {
      var userIps = reply;
      console.log('userIps', userIps);
      var promises = [];
      _.forEach(options, function (value, index) {
        var userNumIps = userIps[index].length,
          numRemediate,
          maxDays = 5,
          currTime,
          lastSlice = 0,
          currUser = value;
        console.log('num user Ips for %s is %s ', currUser, userNumIps);
         // What we will remediate per day (60%)
        numRemediate = Math.floor((3 * userNumIps / 5) / maxDays);
        // start days out
        i = 0;
        if (numRemediate > 0) {
          for (var j = 0; j < maxDays; j++) {
            var currIps = _.slice(userIps[index], i, i + numRemediate - 1);
            i = i + numRemediate;
            currTime = moment().subtract(k, 'days').format('x');
            k = k - 1;
            promises.push(mitigationService.remediate(ticketKey, currUser, currIps, currTime));
          }
        }
      });
      return q.all(promises);
    })
    .then(function (reply) {
      console.log('reply from q.all ', reply);
    })
    .then(function (reply) {
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

