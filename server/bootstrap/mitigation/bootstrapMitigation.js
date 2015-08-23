'use strict';

var test = require('tape-catch');
var q = require('q');
var _ = require('lodash-compat');
var config = require('../../config/config');
var logger = require('../../utils/logger')(module);
var moment = require('moment');

var dimsUtils = require('../../utils/util');
var fs = require('fs');
var keyGen = require('../../models/keyGen');

// Enable service discovery for this file
var diContainer = require('../../services/diContainer')();
var redis = require('redis');

var client = redis.createClient();
// Add the regular proxy to diContainer
client.select(0, function (err, reply) {
  if (err) {
    logger.error('test: redis client received error when selecting database ', err);
  } else {
    logger.debug('test: redis has selected db', 0, 'reply is ', reply);
    client.flushdb();
  }
});
diContainer.factory('db', require('../../utils/redisProxy'));
diContainer.register('client', client);
diContainer.factory('anonService', require('../../services/anonymize'));
diContainer.factory('Ticket', require('../../models/ticket'));
diContainer.factory('UserSettings', require('../../models/userSettings'));
diContainer.factory('mitigationService', require('../../services/mitigation'));

var Ticket = diContainer.get('Ticket');
var mitigationService = diContainer.get('mitigationService');
var anonService = diContainer.get('anonService');
var db = diContainer.get('db');

var ROOT_DIR = __dirname + '/../../';
logger.debug('ROOT_DIR is ', ROOT_DIR);

var ticketKey;

test('Create mitigation ticket', function (assert) {

  var ipPath = __dirname + '/mitigation_ips.txt';
  var parsonsIps, dittrichIps, parsonsChunk, dittrichChunk;
  var k = 15;
  var i = 0;
  var time = moment().subtract(k, 'days').format('x');

  mitigationService.initiateMitigation(ipPath, 'lparsons')
  .then(function (reply) {
    // will fix this behavior later
    ticketKey = keyGen.ticketKey(reply.parent);
    console.log(ticketKey);
    return mitigationService.removeIps(ticketKey + ':mitigation:user:lparsons', ['undefined']);
  })
  .then(function (reply) {
    return mitigationService.removeIps(ticketKey + ':mitigation:user:dittrich', ['undefined']);
  })
  .then(function (reply) {
    // console.log(reply);
    // console.log(reply.parent);
    // returns last topic, get the key
    return mitigationService.getUserIps(ticketKey, 'lparsons');
  })
  .then(function (reply) {
    console.log(reply);
    parsonsIps = reply;
    return mitigationService.getUserIps(ticketKey, 'dittrich');
  })
  .then(function (reply) {
    dittrichIps = reply;
    parsonsChunk = [
      _.slice(parsonsIps, 0, 10),
      _.slice(parsonsIps, 11, 15),
      _.slice(parsonsIps, 16, 17),
      _.slice(parsonsIps, 18, 19),
      _.slice(parsonsIps, 20, 25)
    ];
    dittrichChunk = [
      _.slice(dittrichIps, 0, 2),
      _.slice(dittrichIps, 3, 6),
      _.slice(dittrichIps, 7, 10),
      _.slice(dittrichIps, 11, 12),
      _.slice(dittrichIps, 13, 17)
    ];
    console.log(dittrichChunk);

    return mitigationService.testRemediate(ticketKey, 'lparsons', parsonsChunk[i], time);
  })
  .then(function (reply) {
    console.log(reply);
    k = k - 1;
    i = i + 1;
    var time = moment().subtract(k, 'days').format('x');
    return mitigationService.testRemediate(ticketKey, 'lparsons', parsonsChunk[i], time);
  })
  .then(function (reply) {
    console.log(reply);
    k = k - 1;
    i = i + 1;
    var time = moment().subtract(k, 'days').format('x');
    return mitigationService.testRemediate(ticketKey, 'lparsons', parsonsChunk[i], time);
  })
  .then(function (reply) {
    console.log(reply);
    k = k - 1;
    i = i + 1;
    var time = moment().subtract(k, 'days').format('x');
    return mitigationService.testRemediate(ticketKey, 'lparsons', parsonsChunk[i], time);
  })
  .then(function (reply) {
    console.log(reply);
    k = k - 1;
    i = i + 1;
    var time = moment().subtract(k, 'days').format('x');
    return mitigationService.testRemediate(ticketKey, 'lparsons', parsonsChunk[i], time);
  })
  .then(function (reply) {
    console.log(reply);
    k = k - 1;
    i = 0;
    var time = moment().subtract(k, 'days').format('x');
    return mitigationService.testRemediate(ticketKey, 'dittrich', dittrichChunk[i], time);
  })
  .then(function (reply) {
    console.log(reply);
    k = k - 1;
    i = i + 1;
    var time = moment().subtract(k, 'days').format('x');
    return mitigationService.testRemediate(ticketKey, 'dittrich', dittrichChunk[i], time);
  })
  .then(function (reply) {
    console.log(reply);
    k = k - 1;
    i = i + 1;
    var time = moment().subtract(k, 'days').format('x');
    return mitigationService.testRemediate(ticketKey, 'dittrich', dittrichChunk[i], time);
  })
  .then(function (reply) {
    console.log(reply);
    k = k - 1;
    i = i + 1;
    var time = moment().subtract(k, 'days').format('x');
    return mitigationService.testRemediate(ticketKey, 'dittrich', dittrichChunk[i], time);
  })
  .then(function (reply) {
    console.log(reply);
    k = k - 1;
    i = i + 1;
    var time = moment().subtract(k, 'days').format('x');
    return mitigationService.testRemediate(ticketKey, 'dittrich', dittrichChunk[i], time);
  })
  .then(function (reply) {
    return mitigationService.removeIps(ticketKey + ':mitigation:mitigated', ['undefined']);
  })
  .then(function (reply) {
    return mitigationService.getMitigated(ticketKey);
  })
  .then(function (reply) {
    console.log(reply);
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    console.log(err.stack);
  });

});

test('Finished', function (assert) {
    logger.debug('Quitting redis');
    client.quit(function (err, reply) {
      logger.debug('quit reply ', reply);
      assert.end();
    });
  });
