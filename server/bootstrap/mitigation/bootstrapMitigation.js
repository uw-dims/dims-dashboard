'use strict';

// File: server/bootstrap/mitigaton/bootstrapMitigation.js

// Bootstrap initial data for mitigation demonstration

var _ = require('lodash-compat');
var moment = require('moment');
var redis = require('redis');
var path = require('path');
var ROOT_DIR = __dirname + '/../../';

var keyGen = require(path.join(ROOT_DIR, '/models/keyGen'));

var diContainer = require(path.join(ROOT_DIR, '/services/diContainer'))();
var client = redis.createClient();

diContainer.factory('anonService', require(path.join(ROOT_DIR, '/services/anonymize')));
diContainer.factory('db', require(path.join(ROOT_DIR, '/utils/redisProxy')));
diContainer.register('client', client);
diContainer.factory('Ticket', require(path.join(ROOT_DIR, '/models/ticket')));
diContainer.factory('UserSettings', require(path.join(ROOT_DIR, '/models/userSettings')));
diContainer.factory('mitigationService', require(path.join(ROOT_DIR, '/services/mitigation')));

var mitigationService = diContainer.get('mitigationService');
// var anonService = diContainer.get('anonService');
// var db = diContainer.get('db');

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
      // will fix this behavior later
      ticketKey = keyGen.ticketKey(reply.parent);
      console.log(ticketKey);
      return mitigationService.removeIps(ticketKey + ':mitigation:user:testuser1', ['undefined']);
    })
    .then(function (reply) {
      return mitigationService.removeIps(ticketKey + ':mitigation:user:testuser2', ['undefined']);
    })
    .then(function (reply) {
      return mitigationService.getUserIps(ticketKey, 'testuser1');
    })
    .then(function (reply) {
      console.log(reply);
      testuser1Ips = reply;
      return mitigationService.getUserIps(ticketKey, 'testuser2');
    })
    .then(function (reply) {
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

      return mitigationService.testRemediate(ticketKey, 'testuser1', testuser1Chunk[i], time);
    })
    .then(function (reply) {
      console.log(reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.testRemediate(ticketKey, 'testuser1', testuser1Chunk[i], time);
    })
    .then(function (reply) {
      console.log(reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.testRemediate(ticketKey, 'testuser1', testuser1Chunk[i], time);
    })
    .then(function (reply) {
      console.log(reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.testRemediate(ticketKey, 'testuser1', testuser1Chunk[i], time);
    })
    .then(function (reply) {
      console.log(reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.testRemediate(ticketKey, 'testuser1', testuser1Chunk[i], time);
    })
    .then(function (reply) {
      console.log(reply);
      k = k - 1;
      i = 0;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.testRemediate(ticketKey, 'testuser2', testuser2Chunk[i], time);
    })
    .then(function (reply) {
      console.log(reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.testRemediate(ticketKey, 'testuser2', testuser2Chunk[i], time);
    })
    .then(function (reply) {
      console.log(reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.testRemediate(ticketKey, 'testuser2', testuser2Chunk[i], time);
    })
    .then(function (reply) {
      console.log(reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.testRemediate(ticketKey, 'testuser2', testuser2Chunk[i], time);
    })
    .then(function (reply) {
      console.log(reply);
      k = k - 1;
      i = i + 1;
      var time = moment().subtract(k, 'days').format('x');
      return mitigationService.testRemediate(ticketKey, 'testuser2', testuser2Chunk[i], time);
    })
    .then(function (reply) {
      return mitigationService.removeIps(ticketKey + ':mitigation:mitigated', ['undefined']);
    })
    .then(function (reply) {
      return mitigationService.getMitigated(ticketKey);
    })
    .then(function (reply) {
      console.log(reply);
      client.quit(function (err, reply) {
        console.log('quit reply ', reply);
      });
    })
    .catch(function (err) {
      console.log(err);
      console.log(err.stack);
      client.quit(function (err, reply) {
        console.log('quit reply ', reply);
      });
    })
    .done();
  };

  if (!module.parent) {
    bootstrapMitigation.runBootstrap();
  }

})();

