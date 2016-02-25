'use strict';

var config = require('../config/config');
var logger = require('../utils/logger')(module);
var q = require('q');
// var fs = require('fs');
var ChildProcess = require('../services/childProcess');
var _ = require('lodash-compat');
var dimsUtils = require('../utils/util');
var keyGen = require('../models/keyGen');
var c = require('../config/redisScheme');
var naturalSort = require('javascript-natural-sort');

module.exports = function (Ticket, Topic, anonService, Attributes, store, UserModel) {

  var mitigation = {};

  var keyMapping = {
    initial: 'initial_ips',
    mitigated: 'mitigated',
    user: 'user',
    data: 'data',
    unknown: 'unknown'
  };

  var topicInfo = {
    initial:  {
      desc: 'Initial set of IPs that need to be mitigated',
      datatype: 'set'
    },
    mitigated: {
      desc: 'Set of IPs that have already been mitigated',
      datatype: 'set'
    },
    user: {
      desc: 'Set of IPs that need to be mitigated, belonging to user ',
      datatype: 'set'
    },
    data: {
      desc: 'Total number of IPs mitigated vs. time',
      datatype: 'set'
    },
    unknown: {
      desc: 'Unknown IPs that need to be mitigated',
      datatype: 'set'
    }
  };

  var getTopicConfig = function getTopicConfig(type, user) {
    var name;
    if (type === 'user') {
      if (user !== undefined) {
        name = keyMapping[type] + c.config.delimiter + user;
      } else {
        throw new Error('mitigation.getTopicConfig: user was not defined but was required');
      }
    } else {
      name = keyMapping[type];
    }
    return {
      name: name,
      description: topicInfo[type].desc,
      datatype: topicInfo[type].datatype
    };
  };

  // Map File containing user attributes. This is updated by the attributes service
  // every time a user's attributes change
  var mapPath = config.dashboardDataPath + 'dashboard_user_attributes.yml';

  var listMitigations = function listMitigations(user, query) {
    console.log('query in listMitigations', query);
    var promises = [];
    var keyArray = [];

    // TODO: break this out into its own module or function - used in ticket service as well. Or call it
    // from there
    keyArray.push(keyGen.ticketTypeKey('mitigation'));
    if (query.hasOwnProperty('open') ) {
      if (query.open) {
        keyArray.push(keyGen.ticketOpenKey());
      } else {
        keyArray.push(keyGen.ticketClosedKey());
      }
    }
    if (query.hasOwnProperty('tg')) {
      keyArray.push(keyGen.ticketTgKey(query.tg));
    }
    logger.debug('listMitigations keyArray is ', keyArray);
    return store.intersectItems(keyArray)
    .then(function (reply) {
      // Array of keys to mitigations
      console.log('listMitigations', reply);
      _.forEach(reply, function (value, index) {
        promises.push(getMitigation(value, user));
      });
      return q.all(promises);
    })
    .catch(function (err) {
      console.error('caught error in listMitigations', err.toString(), '- will return empty array');
      // return no items found - empty array
      return q.fcall(function () {
        return [];
      });
    });
  };

  var getMitigation = function getMitigation(key, user) {
    logger.debug('getMitigation key, user ', key, user);
    var result = {},
        mappedKeys;
    result.key = key;
    result.ips = {};
    result.ips.user = user;
    return mapTopicKeys(key)
    .then(function (reply) {
      mappedKeys = reply;
      return q.all([
          Ticket.getTicket(key),
          getUserIps(key, user),
          getMitigatedData(key),
          store.countItems(mappedKeys.initial),
          store.countItems(mappedKeys.unknown),
          store.countItems(mappedKeys.mitigated)
      ]);
    })
    .then(function (reply) {
      result.metadata = reply[0].metadata;
      result.ips.data = reply[1].sort(naturalSort);
      result.data = reply[2];
      result.metadata.initialNum = reply[3];
      result.metadata.unknownNum = reply[4];
      result.metadata.mitigatedNum = reply[5];
      result.metadata.knownNum = reply[3] - reply[4];
      console.log(result.metadata);
      return result;
    })
    .catch(function (err) {
      throw err;
    });
  };

  // var getTickets = function getTickets() {
  //   // Get all mitigation tickets
  //   var promises = [];
  //   var config = {
  //     type: 'mitigation'
  //   };
  //   return Ticket.getTickets(config)
  //   .then(function (reply) {
  //     _.forEach(reply, function (value, key) {
  //       var ticket = value;
  //       promises.push(addTopics(ticket));
  //     });
  //     return q.all(promises);
  //   })
  //   .catch(function (err) {
  //     console.log('caught error in getTickets', err);
  //     throw err;
  //   });
  // };



  var initiateMitigation = function initiateMitigation(ipData, user, tg, ticketName, description, startTime) {
    console.log('Initiating mitigation: user %s, tg %s, ticketName %s, description %s, startTime %s',
      user, tg, ticketName, description, startTime);
    // console.log('ipData', ipData);
    // var ipData = fs.readFileSync(ipPath, {encoding: 'utf-8'});
    var ticketConfig = {
      creator: user,
      type: 'mitigation',
      name: ticketName,
      description: description,
      open: true,
      private: false,
      tg: tg
    };
    var ticket = Ticket.ticketFactory(ticketConfig);
    var binnedIps;
    var initialIps = [];
    var unknownIps = [];
    var users = [];

    if (startTime === undefined) {
      startTime = dimsUtils.createTimestamp();
      console.log('initiateMitigation: time is undefined - using current time: ', startTime);
    }

    // TODO - add userservice so we don't have to call the model directly
    return UserModel.Users.forge().fetch()
    .then(function (collection) {
      _.forEach(collection.toJSON(), function (value) {
        users.push(value.ident);
      });
      console.log('initiateMitigation. all users: ', users);
      return ticket.create();
    })
    .then(function () {
      console.log('-----------------------------------');
      console.log('Ticket created. Now assign IPs to users who are tracking them');
      return anonService.setup({
        data: ipData,
        useFile: false,
        type: 'anon',
        mapName: mapPath,
        outputType: 'json'}, 'true', 'true');
    })
    .then(function (reply) {
      console.log('initiateMitigation. reply from anonService.setup', reply);
      var anonChild = new ChildProcess();
      return anonChild.startProcess('python', reply);
    })
    .then(function (reply) {
      binnedIps = JSON.parse(reply);
      // console.log(binnedIps);
      return q.allSettled(_.map(users, function (user) {
        if (binnedIps.matching.hasOwnProperty(user)) {
          // Add this user's IPs to initialIPs first
          initialIps.push.apply(initialIps, ipListToArray(binnedIps.matching[user]));
          var userIps = [];
          userIps.push.apply(userIps, ipListToArray(binnedIps.matching[user]));
          console.log('-----------------------------------');
          console.log('Will add a topic for IPs belonging to user ', user, ' so they can be tracked.');
          console.log('User ', user, ' is responsible for these IPs. Number: ', userIps.length);
          console.log('-----------------------------------');
          // console.log(binnedIps.matching[user]);
          // console.log(userIps);
          // Create topic to store this user's binned IPs
          return Topic.topicFactory(ticket, getTopicConfig('user', user))
           .create(userIps);
        }
      }));
    })
    .then(function () {
      // Add unknown IPs to initial and to nonmatching
      initialIps.push.apply(initialIps, ipListToArray(binnedIps.nonmatching));
      unknownIps.push.apply(unknownIps, ipListToArray(binnedIps.nonmatching));
      console.log('Number of initialIps: ', initialIps.length);
      console.log('Number of unknownIps: ', unknownIps.length);
      var promises = [];
      promises.push(Topic.topicFactory(ticket, getTopicConfig('unknown')).create(unknownIps));
      promises.push(Topic.topicFactory(ticket, getTopicConfig('initial')).create(initialIps));
      promises.push(Topic.topicFactory(ticket, getTopicConfig('data')).create([0], startTime));
      return q.all(promises);
    })
    // .then(function () {
    //   return Topic.topicFactory(ticket, getTopicConfig('initial')).create(initialIps);
    // })
    // // Can't create mitigated topic yet since no IPs exist for that yet
    // .then(function () {
    //   return Topic.topicFactory(ticket, getTopicConfig('data')).create([0], startTime);
    // })
    .then(function () {
      // Return the key of the ticket
      return keyGen.ticketKey(ticket.metadata);
    })
    .catch(function (err) {
      console.log(err);
      throw err;
    });
  };

  // Returns promise with object which maps a topic key to a keyMapping value
  var mapTopicKeys = function mapTopicKeys(ticketKey) {
    var result = {};
    var topicSetKey = keyGen.topicSetKeyFromTicketKey(ticketKey);
    return store.listItems(topicSetKey)
    .then(function (reply) {
      _.forEach(reply, function (value, index) {
        var keyArray = value.split(c.config.delimiter);
        var restArray = _.slice(keyArray, 4);
        if (restArray[0] === keyMapping.user) {
          result[restArray[1]] = value;
        } else {
          result[_.invert(keyMapping)[restArray[0]]] = value;
        }
      });
      return result;
    })
    .catch(function (err) {
      throw err;
    });
  };

  var remediate = function remediate(ticketKey, user, ips, time) {
    // user is the user submitting the request
    // ticketkey is key to mitigation ticket
    // ips - array of ips that have been mitigated
    // time is mitigation time - will use current time if it is not
    // supplied (usually used for simulations);
    var mappedKeys,
        numAlreadyMitigated = 0,
        totalMitigated = 0,
        willMitigate = ips.length,
        ticket,
        promises = [];

    if (time === undefined) {
      time = dimsUtils.createTimestamp();
      console.log('***time is undefined ');
    }
    console.log('remediate. time is ', time);
    console.log('remediate. start. ips are ', ips);
    console.log('remediate. start. ips length = willMitigate = ', willMitigate);

    // Get the ticket
    return Ticket.getTicket(ticketKey)
    .then(function (reply) {
      ticket = reply;
      // Get the mapping of topic keys
      return mapTopicKeys(ticketKey);
    })
    .then(function (reply) {
      mappedKeys = reply;
      console.log('remediate. mitigated key is ', mappedKeys.mitigated);
      if (mappedKeys.mitigated === undefined) {
        numAlreadyMitigated = 0;
        console.log('remediate. need to create topic');
        return Topic.topicFactory(ticket, getTopicConfig('mitigated')).create(ips);
      } else {
        console.log('remediate. already created so get count');
        return store.countItems(mappedKeys.mitigated);
      }
    })
    .then(function (reply) {
      console.log('remediate. reply from either create or num', reply);
      if (mappedKeys.mitigated !== undefined) {
        numAlreadyMitigated = reply;
        // Add the mitigate IPs to the mitigated topic
        promises.push(store.addItem(ips, mappedKeys.mitigated));
      }
      console.log('remediate. numAlreadyMitigated = ', numAlreadyMitigated);
      // update total number of mitigated IPs including the new ones
      totalMitigated = numAlreadyMitigated + willMitigate;
      console.log('remediate. totalMitigated = ', totalMitigated);
      console.log('remediate. Now user is ', user);
      console.log('remediate. user key is ', mappedKeys[user]);
      console.log('remediate. data key is ', mappedKeys.data);
      // Remove the mitigated IPs from the user topic
      promises.push(store.removeItem(ips, mappedKeys[user]));
      // Store the current number of mitigated IPs in the data topic
      promises.push(store.addItem(totalMitigated, mappedKeys.data, time));
      return q.all(promises);
    })
    .catch(function (err) {
      logger.debug(err);
      throw err;
    });
  };

  var ipListToArray = function ipListToArray(ips) {
    // logger.debug('ipListtoArray ips ', ips);
    var result = [];
    _.forEach(ips, function (n, key) {
      result.push(key);
    });
    logger.debug(result);
    return result;
  };

  // If user is not supplied or is null, this will return an empty array
  // Maybe should re-work promises so that null or undefined user is not
  // even submitted and an empty array is returned
  var getUserIps = function getUserIps(ticketKey, user) {
    // console.log('getUserIps ', ticketKey, user);
    return mapTopicKeys(ticketKey)
    .then(function (reply) {
      var mappedKeys = reply;
      // console.log('getUserIps ', mappedKeys);
      // console.log('getUserIps key is ', mappedKeys[user]);
      return store.listItems(mappedKeys[user]);
    })
    .then(function (reply) {
      return reply.sort();
    })
    .catch(function (err) {
      logger.error('getUserIps caught error, will return empty array. Error: ', err.toString());
      return [];
    });
  };

  var getMitigated = function getMitigated(ticketKey) {
    return mapTopicKeys(ticketKey)
    .then(function (reply) {
      var mappedKeys = reply;
      return store.listItems(mappedKeys.mitigated);
    })
    .then(function (reply) {
      return reply.sort();
    })
    .catch(function (err) {
      logger.error('getMitigated caught error, will return empty array. Error: ', err.toString());
      return [];
    });
  };

  var getMitigatedData = function getMitigatedData(ticketKey) {
    return mapTopicKeys(ticketKey)
    .then(function (reply) {
      var mappedKeys = reply;
      return store.listItemsWithScores(mappedKeys.data);
    })
    .then(function (reply) {
      return formatData(reply);
    })
    .catch(function (err) {
      logger.error('getMitigatedData caught error, will return empty array. Error: ', err.toString());
      return [];
    });
  };

  // Formats data to array of [x, y]
  var formatData = function formatData(data) {
    var result = [];
    var chunked = _.chunk(data, 2);
    _.forEach(chunked, function (value, index) {
      result.push([_.parseInt(value[1]), _.parseInt(value[0])]);
    });
    return result;
  };

  mitigation.initiateMitigation = initiateMitigation;
  mitigation.remediate = remediate;
  mitigation.getUserIps = getUserIps;
  mitigation.getMitigated = getMitigated;
  mitigation.listMitigations = listMitigations;
  mitigation.getMitigatedData = getMitigatedData;
  mitigation.getMitigation = getMitigation;

  return mitigation;

};
