'use strict';

// File: server/bootstrap/mitigaton/bootstrapMitigation.js

// Bootstrap initial data for mitigation demonstration

var _ = require('lodash-compat');
var moment = require('moment');
var path = require('path');
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

  //options is array of 2 users to use for mitigation progress bootstrap
  exports.runBootstrap = bootstrapMitigation.runBootstrap = function (options) {

    var ticketKey;
    var ipPath = __dirname + '/mitigation_ips.txt';
    var user1Ips, user2Ips, user1Chunk, user2Chunk;
    var k = 15;
    var i = 0;
    var time = moment().subtract(k, 'days').format('x');
    var user1 = options[0];
    var user2 = options[1];

    mitigationService.initiateMitigation(ipPath, user1)
    .then(function (reply) {
      ticketKey = reply;
      console.log('bootstrapMitigation ticketKey', ticketKey);
      return mitigationService.getUserIps(ticketKey, user1);
    })
    .then(function (reply) {
      console.log(reply);
      user1Ips = reply;
      return mitigationService.getUserIps(ticketKey, user2);
    })
    .then(function (reply) {
      console.log(reply);
      user2Ips = reply;
      user1Chunk = [
        _.slice(user1Ips, 0, 10),
        _.slice(user1Ips, 11, 15),
        _.slice(user1Ips, 16, 17),
        _.slice(user1Ips, 18, 19),
        _.slice(user1Ips, 20, 25)
      ];
      user2Chunk = [
        _.slice(user2Ips, 0, 2),
        _.slice(user2Ips, 3, 6),
        _.slice(user2Ips, 7, 10),
        _.slice(user2Ips, 11, 12),
        _.slice(user2Ips, 13, 17)
      ];
      console.log(user2Chunk);
      return mitigationService.remediate(ticketKey, user1, user1Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, user1, user1Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, user1, user1Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, user1, user1Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, user1, user1Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = 0;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, user2, user2Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, user2, user2Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, user2, user2Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, user2, user2Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, user2, user2Chunk[i], time);
    })
    .then(function () {
      return mitigationService.getMitigated(ticketKey);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from getMitigated', reply);
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
  };

  if (!module.parent) {
    bootstrapMitigation.runBootstrap(process.argv.slice(2));
  }

})();

