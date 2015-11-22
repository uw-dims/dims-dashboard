'use strict';

var config = require('../config/config');
var logger = require('../utils/logger')(module);
var q = require('q');
var fs = require('fs');
var ChildProcess = require('../services/childProcess');
var _ = require('lodash-compat');
var dimsUtils = require('../utils/util');
var keyGen = require('../models/keyGen');

module.exports = function (Ticket, anonService, UserSettings, db) {

  var mitigation = {};

  var initialTopic =  {
    topic: 'initial_ips',
    dataType: 'set'
  };

  // var initialData = {
  //   shortDesc: 'Initial Set of IPs to mitigate',
  //   description: 'Initial IPs needing mitigation',
  //   displayType: 'mitigation'
  // };

  // For testing
  var users = ['testuser1', 'testuser2', 'testuser3', 'testuser4'];

  // Just for demo:
  var mapPath = __dirname + '/../bootstrap/userAttributes.yml';

  var initiateMitigation = function initiateMitigation(ipPath, user) {
    var ipData = fs.readFileSync(ipPath, {encoding: 'utf-8'});
    var ticket = Ticket.ticketFactory();
    var binnedIps;
    var initialIps = [];
    return ticket.create('mitigation', user)
    .then(function (reply) {
      return anonService.setup({data: ipData, useFile: false, type: 'anon', mapName: mapPath, outputType: 'json'}, 'lparsons');
    })
    .then(function (reply) {
      var anonChild = new ChildProcess();
      return anonChild.startProcess('python', reply);
    })
    .then(function (reply) {
      binnedIps = JSON.parse(reply);
      console.log(binnedIps);
      //console.log(binnedIps);
      return q.allSettled(_.map(users, function (user) {
        var name = 'user:' + user;
        logger.debug('user is ', user);
        if (binnedIps.matching.hasOwnProperty(user)) {
          logger.debug('will add topic');
          return ticket.addTopic(name, 'set').then (function (reply) {
            initialIps.push.apply(initialIps, ipListToArray(binnedIps.matching[user]));
            console.log(initialIps);
            return addIpsToSet(reply, binnedIps.matching[user]);
          });
        }
      }));
    })
    .then(function (reply) {
      return ticket.addTopic('unknown', 'set');
    })
    .then(function (reply) {
      initialIps.push.apply(initialIps, ipListToArray(binnedIps.nonmatching));
      return addIpsToSet(reply, binnedIps.nonmatching);
    })
    .then(function (reply) {
      return ticket.addTopic(initialTopic.topic, initialTopic.dataType);
    })
    .then(function (reply) {
      logger.debug(keyGen.topicKey(reply));
      logger.debug('initialIps', initialIps);
      return addIps(keyGen.topicKey(reply), initialIps);
    })
    .then(function (reply) {
      return ticket.addTopic('mitigated', 'set');
    })
    .then(function (reply) {
      return ticket.addTopic('data', config.defaultRedisTypes.sortedSet, '0', dimsUtils.createTimestamp());
    })
    .catch(function (err) {
      console.log(err);
      console.log(err.stack);
      return new Error(err);
    });

  };

  var remediate = function remediate(ticketkey, user, ips) {
    // user is the user submitting the request
    // ticketkey is key to mitigation ticket
    // ips - array of ips
    var userKey = ticketKey + ':mitigation:user:' + user;
    var dataKey = ticketKey + ':mitigation:data';
    var willMitigate = ips.length;
    var numAlreadyMitigated;
    return getNumMitigated(ticketKey)
    .then(function (reply) {
      numAlreadyMitigated = reply;
      return removeIps(userKey, ips);
    })
    .then(function (reply) {
      logger.debug('remediate reply', reply);
      var totalMitigated = numAlreadyMitigated + willMitigate;
      return updateMitigated(dataKey, totalMitigated);
    })
    .catch(function (err) {
      logger.debug(err);
      return new Error(err);
    });
  };

  // For testing - we supply the timestamp
  var testRemediate = function testRemediate(ticketKey, user, ips, time) {
    // user is the user submitting the request
    // ticketkey is key to mitigation ticket
    // ips - array of ips
    var userKey = ticketKey + ':mitigation:user:' + user;
    var dataKey = ticketKey + ':mitigation:data';
    var mitigatedKey = ticketKey + ':mitigation:mitigated';
    var willMitigate = ips.length;
    var numAlreadyMitigated;
    return getNumMitigated(ticketKey)
    .then(function (reply) {
      numAlreadyMitigated = reply;
      return removeIps(userKey, ips);
    })
    .then(function (reply) {
      logger.debug('remove reply', reply);
      return addIps(mitigatedKey, ips);
    })
    .then(function (reply) {
      logger.debug('add reply', reply);
      var totalMitigated = numAlreadyMitigated + willMitigate;
      return db.zaddProxy(dataKey, time, totalMitigated);
    })
    .catch(function (err) {
      logger.debug(err);
      return new Error(err);
    });
  };

  var updateMitigated = function updateMitigated(key, content) {
    return db.zaddProxy(key, dimsUtils.createTimestamp(), content);
  };

  var ipListToArray = function ipListToArray(ips) {
    logger.debug('ipListtoArray ips ', ips);
    var result = [];
    _.forEach(ips, function (n, key) {
      result.push(key);
    });
    logger.debug(result);
    return result;
  };

  var addIpsToSet = function addIpsToSet(topic, ips) {
    var topickey = keyGen.topicKey(topic);
    return q.allSettled(
      _.forEach(ips, function (n, key) {
        return db.saddProxy(topickey, key);
      })
    );
  };

  var getNumNotMitigated = function getNumNotMitigated(key) {
    var initialKey = key + ':mitigation:initial_ips';
    var mitigatedKey = key + ':mitigation:mitigated';
    var total;
    return db.scardProxy(initialKey)
    .then(function (reply) {
      total = reply;
      return db.scardProxy(topicKey);
    })
    .then(function (reply) {
      return total - reply;
    });
  };

  var getNumMitigated = function getNumMitigated(key) {
    var topicKey = key + ':mitigation:mitigated';
    return db.scardProxy(topicKey);
  };

  var getNumForUser = function getNumForUser(key, user) {
    var topicKey = key + ':mitigation:user:' + user;
    return db.scardProxy(topicKey);
  };

  var getUserIps = function getUserIps(key, user) {
    var topicKey = key + ':mitigation:user:' + user;
    return db.smembersProxy(topicKey);
  };

  var getMitigated = function getMitigated(key) {
    var mitigatedKey = key + ':mitigation:mitigated';
    return db.smembersProxy(mitigatedKey);
  };

  var removeIps = function removeIps(key, ips) {
    // ips is array of ips to remove
    // key is topic key
    var args = [key];
    args.push.apply(args, ips);
    return db.sremProxy(args);
  };

  var addIps = function addIps(key, ips) {
    // ips is array of ips to remove
    // key is topic key
    var args = [key];
    args.push.apply(args, ips);
    return db.saddProxy(args);
  };

  var updateMitigation = function updateMitigation(key, ipPath, user) {

  };

  mitigation.initiateMitigation = initiateMitigation;
  mitigation.remediate = remediate;
  mitigation.getUserIps = getUserIps;
  mitigation.getMitigated = getMitigated;
  mitigation.testRemediate = testRemediate;
  mitigation.removeIps = removeIps;

  return mitigation;

};
