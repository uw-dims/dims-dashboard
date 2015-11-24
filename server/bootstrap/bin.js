'use strict';

// Demonstrate how system can bin IPs

var _ = require('lodash-compat');
var moment = require('moment');
var redis = require('redis');
var path = require('path');
var ROOT_DIR = __dirname + '/../';


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

(function () {
  var bin = {};

  exports.runBin = bin.runBin = function () {

    var ticketKey;
    var ipPath = __dirname + '/mitigation/mitigation_demo_short.txt';

    mitigationService.initiateMitigation(ipPath, 'testuser2')
    .then(function (reply) {
      // will fix this behavior later
      ticketKey = keyGen.ticketKey(reply.parent);
      // console.log(ticketKey);
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
    bin.runBin();
  }

})();
