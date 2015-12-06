'use strict';

/**
  * file: models/ticket.js
  */

var config = require('../config/config'),
    keyGen = require('./keyGen'),
    keyExtract = require('./keyExtract'),
    logger = require('../utils/logger')(module),
    q = require('q'),
    _ = require('lodash-compat');

module.exports = function Ticket(store) {

  var timestamp = function () {
    var now = new Date().getTime();
    return now;
  };

  var ticketTypes = {
    'mitigation': {
      name: 'mitigation'
    },
    'activity': {
      name: 'activity'
    },
    'user': {
      name: 'user'
    }
  };

  var validOptions = {
    creator: 'creator',
    type: 'type',
    description: 'description'
  };

  var isValidType = function (type) {
    if (!ticketTypes[type]) {
      return false;
    } else {
      return true;
    }
  };

  var validateConfig = function (config) {
    var defaultConfig = {
      description: ''
    };
    // var newConfig = _.extend({}, defaultConfig, config);
    _.defaults(config, defaultConfig);
    // Must contain creator and type
    if (!config[validOptions.creator] || !config[validOptions.type]) {
      return null;
    }
    // Type must be valid
    if (!isValidType(config.type)) {
      return null;
    }
    return {
      creator: config.creator,
      description: config.description,
      type: config.type
    };
  };

  // Coerce types returned from redis
  var castMetadata = function castMetadata(metadata) {
    metadata.createdTime = _.parseInt(metadata.createdTime);
    metadata.modifiedTime = _.parseInt(metadata.modifiedTime);
    metadata.num = _.parseInt(metadata.num);
    metadata.open = metadata.open === 'true' ? true : false;
    return metadata;
  };

  // Add key to a set with current time as score
  var saveKey = function addToSet(key, setKey) {
    return store.addItem(key, setKey, timestamp());
  };

  var ticketPrototype = {

    close: function close() {
      var self = this;
      return self.exists()
      .then(function (reply) {
        if (reply) {
          self.metadata.open = false;
          self.metadata.modifiedTime = timestamp();
          return store.setMetadata(keyGen.ticketKey(self.metadata), self.metadata);
        } else {
          throw new Error('Cannot close a ticket that does not exist');
        }
      })
      .catch(function (err) {
        throw err;
      });
    },

    open: function open() {
      var self = this;
      return self.exists()
      .then(function (reply) {
        if (reply) {
          self.metadata.open = true;
          self.metadata.modifiedTime = timestamp();
          return store.setMetadata(keyGen.ticketKey(self.metadata), self.getTicketMetadata());
        } else {
          throw new Error('Cannot open a ticket that does not exist');
        }
      })
      .catch(function (err) {
        throw err;
      });
    },

    exists: function exists() {
      var self = this;
      return store.existsInSet(keyGen.ticketKey(self.metadata), keyGen.ticketSetKey());
    },

    create: function create() {
      var self = this;
      self.metadata.createdTime = timestamp();
      self.metadata.modifiedTime = self.metadata.createdTime;
      self.metadata.open = true;
      // Increment the ticket counter
      return store.incrCounter(keyGen.ticketCounterKey())
      .then(function (reply) {
        // Save the counter value
        self.metadata.num = reply;
        // Save the ticket
        return q.all([
          store.setMetadata(keyGen.ticketKey(self.metadata), self.metadata),
          saveKey(keyGen.ticketKey(self.metadata), keyGen.ticketSetKey()),
          saveKey(keyGen.ticketKey(self.metadata), keyGen.ticketOwnerKey(self.metadata)),
          saveKey(keyGen.ticketKey(self.metadata), keyGen.ticketOpenKey()),
          saveKey(keyGen.ticketKey(self.metadata), keyGen.ticketTypeKey(self.metadata.type))
        ]);
      })
      .catch(function (err) {
        // logger.error('models/Ticket.create had an err returned from redis', err.toString());
        throw err;
      });
    },

    // returns properties of the current ticket object as one config
    // Simple getter for the object metadata
    getTicketMetadata: function getTicketMetadata() {
      var self = this;
      return self.metadata;
    },

    // Add a topic to this ticket. Creates topic object, saves to database.
    // Returns topic object
    // dataType is string or set
    addTopic: function addTopic(topicName, dataType, content) {
      var self = this,
      // Create the topic object
          topic = topicFactory({
            parent: self,
            type: self.type,
            name: topicName,
            dataType: dataType
          });
      logger.debug('models/Ticket.addTopic. Content is ', content);
      logger.debug('models/Ticket.addTopic. topicName is ', topicName);
      // Check to see if it already exists
      return topic.exists()
      .then(function (reply) {
        if (!reply) {
          logger.debug('models/Ticket.addTopic. Topic does not exist. Save it. content, score', content, score);
          return topic.save(content).then(function (reply) {
            /* jshint unused: false */
            // Add the topic key to the sorted set of keys
            // The score is the created timestamp, so we don't need to save that
            // elsewhere - can get the score from the set
            return db.zaddProxy(keyGen.topicSetKey(self), dimsUtils.createTimestamp(), keyGen.topicKey(topic));
          })
          .then(function (reply) {
            /* jshint unused: false */
            return topic;
          })
          .catch(function (err) {
            logger.error('models/Ticket.addTopic had an err returned from redis', err, reply);
            throw new Error(err.toString());
          });
        } else {
          logger.debug('models/Ticket.addTopic. Topic already exists. Return rejection to caller ');
          throw new Error('Topic already exists.');
        }
      });
    },

    // Get all topics attached to this ticket and return as Topic objects
    getTopics: function getTopics() {
      var self = this,
          promises = [];
      // First get the array of topic keys
      return self.getTopicKeys()
      .then(function (topicKeys) {
        var topicPromise;
        for (var i = 0; i < topicKeys.length; i++) {
          topicPromise = self.topicFromKey(topicKeys[i]);
          promises.push(topicPromise);
        }
        return q.all(promises);
      })
      .then(function (topics) {
        return topics;
      })
      .catch(function (err) {
        logger.error('Ticket.getTopics had an err returned from redis', err);
        throw err;
      });
    },

    // Get keys of all topics attached to this ticket
    getTopicKeys: function getTopicKeys() {
      var self = this;
      // Get the keys
      return listKeys(keyGen.topicSetKey(self));
    },

    // Construct topic object from a topic key
    topicFromKey: function topicFromKey(key) {
      var self = this;
      // Create a new topic object
      logger.debug('Got to top of topicFromKey');
      logger.debug('key is ', key);
      logger.debug('ticket key is ', keyGen.ticketKey(self.metadata));
      var topic = topicFactory({
        parent: self,
        type: self.type,
        name: keyExtract.topicName(key, keyGen.ticketKey(self.metadata))
      });
      // Get the stored datatype for the topic
      return topic.getDataType()
      .then(function (reply) {
        logger.debug('Ticket.topicFromKey:reply from getDataType ', reply);
        // Set the dataType in the topic object
        topic.setDataType(reply);
        // Return the topic object
        return topic;
      })
      .catch(function (err) {
        logger.error('Ticket.topicFromKey had an err returned from redis', err);
        throw err;
      });
    },

    // Returns metadata of object as a string
    paramString: function paramString() {
      var self = this;
      return self.num + ',' + self.type + ',' + self.creator + ',' + self.createdTime + ',' + self.open;
    }

  };

  // Factory function to create an unsaved ticket object
  var ticketFactory = function ticketFactory(options) {
    if (options === null || options === undefined) {
      return new Error('Failed to provide options to ticketFactory');
    } else {
      if (validateConfig(options) !== false) {
        var metadata = {
          metadata: validateConfig(options)
        };
      } else {
        throw new Error ('Invalid options supplied to ticketFactory');
      }
      return (_.extend({}, ticketPrototype, metadata));
    }
  };

  // all, open, closed, owned, of a particular type
  /**
    {
      type: one of: all, activity, mitigation, user,
      ownedBy: user,
      open: true or false
    }
  */

  var validateQuery = function validateQuery(options) {
    var result;
    if (!options['type']) {
      return null;
    }
    // Type must be valid
    if (!isValidType(options.type) && options.type !== 'all') {
      return null;
    }
    if (options.type === 'user' && !options['ownedBy']) {
      return null;
    }
    if (options.hasOwnProperty(open)) {
      if (!options.open instanceof 'boolean') {
        return null;
      }
    }
    result.type = options.type;
    if (options['ownedBy']) {
      result.ownedBy = options.ownedBy;
    }
    if (options.hasOwnProperty(open)) {
      result.open = options.open;
    }
    return result;
  };

  var getTicketKeys = function getTicketKeys(options) {
    var query = validateQuery(options);
    if (query === null) {
      throw new Error('Invalid query supplied to retrieve tickets');
    }
  };

  var getOpenTicketKeys = function getOpenTicketKeys() {
    return store.listItems(keyGen.ticketOpenKey());
  };

  var getAllTicketKeys = function getAllTicketKeys() {
    return store.listItems(keyGen.ticketSetKey());
  };

  var getAllKeysOfType = function getAllKeysOfType(type, user) {

  };

  var getAllOwnedKeys = function getAllOwnedKeys(owner) {

  };

  // This is what we're exposing
  var ticket = {

    // Factory to create a new ticket object
    ticketFactory: ticketFactory,

    // Static method to return a ticket object populated from the
    // database for a given key
    getTicket: function getTicket(key) {
      return store.getMetadata(key)
      .then(function (reply) {
        if (reply !== null) {
          config = castMetadata(reply);
          var ticket = ticketFactory({
            type: config.type,
            description: config.description,
            creator: config.creator
          });
          _.extend(ticket.metadata, config);
          return ticket;
        } else {
          return null;
        }
      })
      .catch(function (err) {
        throw err;
      });
    },

    // Static method to return array of keys of tickets
    //
    getAllTicketKeys: function getAllTicketKeys(options) {
      options = options || {};
      logger.debug('Ticket.getAllTicketKeys ticketsetkey is ', keyGen.ticketSetKey());
      return db.zrangeProxy(keyGen.ticketSetKey(), 0, -1).then(function (reply) {
        return reply;
      })
      .catch(function (err, reply) {
        logger.error('Ticket.getAllTickets had an err returned from redis', err, reply);
        return new Error(err.toString());
      });
    }
  };

  // If testing, export some private functions
  if (process.env.NODE_ENV === 'test') {
    ticket._private = {
      castMetadata: castMetadata,
      validateConfig: validateConfig,
      validateQuery: validateQuery
    };
  }

  return ticket;
};

