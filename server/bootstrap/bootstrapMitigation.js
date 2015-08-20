'use strict';

var test = require('tape-catch');

var config = require('../../../config/config');
var logger = require('../../../utils/logger')(module);
var ChildProcess = require('../../services/childProcess');

var fs = require('fs');

// Enable service discovery for this file
var diContainer = require('../services/diContainer')();
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
diContainer.factory('db', require('../utils/redisProxy'));
diContainer.register('client', client);
diContainer.factory('anonService', require('./services/anonymize'));

diContainer.factory('Ticket', require('../models/ticket'));
var Ticket = diContainer.get('Ticket');
var anonService = diContainer.get('anonService');
var db = diContainer.get('db');

var ROOT_DIR = __dirname + '/../../';
logger.debug('ROOT_DIR is ', ROOT_DIR);


test('Create mitigation ticket', function (assert) {
  setTimeout(function () {
    var mapPath = __dirname + './userAttributes.yml';
    var ipPath = __dirname + './mitigation_ips.txt';
    var ipData = fs.readFileSync(ipPath, {encoding: 'utf-8'});
    var initialTopic =  {
      topic: 'inital_ips',
      dataType: 'hash'
    };
    var initialData = {
      data: ipData,
      shortDesc: 'Initial Set of IPs to mitigate',
      description: '',
      displayType: 'mitigation'
    };

    var ticket = Ticket.ticketFactory();
    ticket.create('mitigation', 'lparsons')
    .then(function (reply) {
      return ticket.addTopic(initialTopic.topic, initialTopic.dataType, initialData);
    })
    .then(function (reply) {
      return anonService.setup({data: ipData, useFile: false, type: 'anon', mapName: mapPath, outputType: 'json'}, 'lparsons');
    })
    .then(function (reply) {
      logger.debug('bootstrap mitigation Back from anonymize.setup. reply is ', reply);
      var anonChild = new ChildProcess();
      return anonChild.startProcess('python', reply);
    })
    .then(function (reply) {
      logger.debug('bootstrap mitigation anon reply');
      var userIps = JSON.parse(reply);
      console.log(userIps);
      assert.end();
    })
    .catch(function (err) {
      console.log(err);
      assert.end();
    });
  }, 1000);
});
