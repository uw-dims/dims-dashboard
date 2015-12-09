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

  exports.runBootstrap = bootstrapMitigation.runBootstrap = function () {

    var ticketKey;
    var ipPath = __dirname + '/mitigation_ips.txt';
    var testuser1Ips, testuser2Ips, testuser1Chunk, testuser2Chunk;
    var k = 15;
    var i = 0;
    var time = moment().subtract(k, 'days').format('x');

    mitigationService.initiateMitigation(ipPath, 'testuser1')
    .then(function (reply) {
      ticketKey = reply;
      console.log('bootstrapMitigation ticketKey', ticketKey);
      return mitigationService.getUserIps(ticketKey, 'testuser1');
    })
    .then(function (reply) {
      console.log(reply);
      testuser1Ips = reply;
      return mitigationService.getUserIps(ticketKey, 'testuser2');
    })
    .then(function (reply) {
      console.log(reply);
      testuser2Ips = reply;
      testuser1Chunk = [
        _.slice(testuser1Ips, 0, 10),
        _.slice(testuser1Ips, 11, 15),
        _.slice(testuser1Ips, 16, 17),
        _.slice(testuser1Ips, 18, 19),
        _.slice(testuser1Ips, 20, 25)
      ];
      testuser2Chunk = [
        _.slice(testuser2Ips, 0, 2),
        _.slice(testuser2Ips, 3, 6),
        _.slice(testuser2Ips, 7, 10),
        _.slice(testuser2Ips, 11, 12),
        _.slice(testuser2Ips, 13, 17)
      ];
      console.log(testuser2Chunk);
      return mitigationService.remediate(ticketKey, 'testuser1', testuser1Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, 'testuser1', testuser1Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, 'testuser1', testuser1Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, 'testuser1', testuser1Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, 'testuser1', testuser1Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = 0;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, 'testuser2', testuser2Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, 'testuser2', testuser2Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, 'testuser2', testuser2Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, 'testuser2', testuser2Chunk[i], time);
    })
    .then(function (reply) {
      console.log('bootstrapMitigation. reply from remediate ', reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.remediate(ticketKey, 'testuser2', testuser2Chunk[i], time);
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
    bootstrapMitigation.runBootstrap();
  }

})();

