'use strict';

var config = require('../config/config');
var logger = require('../utils/logger')(module);
var q = require('q');


module.exports = function (Ticket, anonService, UserSettings) {

  var mitigation = {};

  var initialTopic =  {
    topic: 'inital_ips',
    dataType: 'hash'
  };

  var initialData = {
    shortDesc: 'Initial Set of IPs to mitigate',
      description: 'Initial IPs needing mitigation',
      displayType: 'mitigation'
  };

  // Just for demo:
  var mapPath = __dirname + '/../bootstrap/userAttributes.yml';

  var initiateMitigation = function initiateMitigation(ipPath, user) {
    var ipData = fs.readFileSync(ipPath, {encoding: 'utf-8'});
    var ticket = Ticket.ticketFactory();
    ticket.create('mitigation', user)
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
      return q.all(_.map(users, function (user) {
        var name = 'user:' + user;
        if (userIps.matching.hasOwnProperty(user)) {
          var config = {
            shortDesc: 'IPs assigned to ' + user,
            description: '',
            displayType: 'mitigation',
            data: JSON.stringify(userIps.matching[user])
          };
          return ticket.addTopic(name, 'hash', config);
        }
      }));
    })
    .then(function (reply) {
      assert.end();
    })
    .catch(function (err) {
      console.log(err);
      assert.end();
    });

  };

  var updateMitigation = function updateMitigation(key, ipPath, user) {

  };

  return mitigation;

};
