/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
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
      _.forEach(reply, function (value, index) {
        promises.push(getMitigation(value, user));
      });
      return q.all(promises);
    })
    .catch(function (err) {
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
      return result;
    })
    .catch(function (err) {
      throw err;
    });
  };

  var initiateMitigation = function initiateMitigation(ipData, user, tg, ticketName, description, startTime) {
    logger.debug('Initiating mitigation: user %s, tg %s, ticketName %s, description %s, startTime %s',
      user, tg, ticketName, description, startTime);
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
      logger.debug('initiateMitigation: time is undefined - using current time: ', startTime);
    }

    // TODO - add userservice so we don't have to call the model directly
    return UserModel.Users.forge().fetch()
    .then(function (collection) {
      _.forEach(collection.toJSON(), function (value) {
        users.push(value.ident);
      });
      return ticket.create();
    })
    .then(function () {
      return anonService.setup({
        data: ipData,
        useFile: false,
        type: 'anon',
        mapName: mapPath,
        outputType: 'json'}, 'true', 'true');
    })
    .then(function (reply) {
      var anonChild = new ChildProcess();
      return anonChild.startProcess('python', reply);
    })
    .then(function (reply) {
      binnedIps = JSON.parse(reply);
      return q.allSettled(_.map(users, function (user) {
        if (binnedIps.matching.hasOwnProperty(user)) {
          // Add this user's IPs to initialIPs first
          initialIps.push.apply(initialIps, ipListToArray(binnedIps.matching[user]));
          var userIps = [];
          userIps.push.apply(userIps, ipListToArray(binnedIps.matching[user]));
      
          return Topic.topicFactory(ticket, getTopicConfig('user', user))
           .create(userIps);
        }
      }));
    })
    .then(function () {
      // Add unknown IPs to initial and to nonmatching
      initialIps.push.apply(initialIps, ipListToArray(binnedIps.nonmatching));
      unknownIps.push.apply(unknownIps, ipListToArray(binnedIps.nonmatching));

      var promises = [];
      promises.push(Topic.topicFactory(ticket, getTopicConfig('unknown')).create(unknownIps));
      promises.push(Topic.topicFactory(ticket, getTopicConfig('initial')).create(initialIps));
      promises.push(Topic.topicFactory(ticket, getTopicConfig('data')).create([0], startTime));
      return q.all(promises);
    })
    
    .then(function () {
      // Return the key of the ticket
      return keyGen.ticketKey(ticket.metadata);
    })
    .catch(function (err) {
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
    }

    // Get the ticket
    return Ticket.getTicket(ticketKey)
    .then(function (reply) {
      ticket = reply;
      // Get the mapping of topic keys
      return mapTopicKeys(ticketKey);
    })
    .then(function (reply) {
      mappedKeys = reply;
      if (mappedKeys.mitigated === undefined) {
        numAlreadyMitigated = 0;
        return Topic.topicFactory(ticket, getTopicConfig('mitigated')).create(ips);
      } else {
        return store.countItems(mappedKeys.mitigated);
      }
    })
    .then(function (reply) {
      if (mappedKeys.mitigated !== undefined) {
        numAlreadyMitigated = reply;
        // Add the mitigate IPs to the mitigated topic
        promises.push(store.addItem(ips, mappedKeys.mitigated));
      }
      // update total number of mitigated IPs including the new ones
      totalMitigated = numAlreadyMitigated + willMitigate;
     
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
    return mapTopicKeys(ticketKey)
    .then(function (reply) {
      var mappedKeys = reply;
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
