'use strict';

/**
  * file: models/ticket.js
  */

var config = require('../config'),
    c = require('../config/redisScheme'),
    keyGen = require('./keyGen'),
    extract = require('./keyExtract'),
    logger = require('../utils/logger'),
    q = require('q'),
    _ = require('lodash'),
    dimsUtils = require('../utils/util');

// exports = module.exports = Ticket;

module.exports = function Ticket(db) {

  var initialTicketConfig = {
    num: null,
    creator: null,
    type: null,
    createdTime: null,
    open: true
  };

  var initialTopicConfig = {
    parent: null,
    type: null,
    name: null,
    dataType: 'hash'
  };

  var ticketPrototype = {

    // Obtains a counter value for the new ticket, sets the
    // created time, and adds the ticket to the database.
    // Adds the new ticket key to the set of all keys
    create: function create(type, creator) {
      var self = this,
          deferred = q.defer();
      self.creator = creator;
      self.type = type;
      self.open = true;
      self.createdTime = dimsUtils.createTimestamp();

      // Increment the ticket counter
      return db.incr(keyGen.ticketCounterKey())
      .then(function (reply) {
        // Save the counter value
        self.num = reply;;
        // Save the data to datastore
        return db.hmset(keyGen.ticketKey(self), self.getTicketMetadata());
      })
      .then(function (result) {
        // Successfully saved the ticket
        // Add the ticket key to the sorted set of tickets. score is created time
        return db.zadd(keyGen.ticketSetKey(), self.createdTime, keyGen.ticketKey(self));
      })
      .then(function (reply) {
        // return the ticket
        return self;
      })
      .catch(function (err) {
        logger.error('models/Ticket.create had an err returned from redis', err);
        return new Error(err.toString());
      });
      // return deferred.promise;
    },

    // returns properties of the current ticket object as one config
    // Simple getter for the object metadata
    getTicketMetadata: function getTicketMetadata() {
      var self = this,
          config = {
            num: self.num,
            creator: self.creator,
            type: self.type,
            createdTime: self.createdTime,
            open: self.open
          };
      return config;
    },

    // Update the current ticket object with data from datastore
    // Resolves to self
    // Was getTicket - but doesn't return a ticket object, just the metadata
    // TODO: Do we still need this function?
    pullTicketMetadata: function pullTicketMetadata() {
      var self = this,
          key = keyGen.ticketKey(self);
      return db.hgetall(key).then(function (reply) {
        var keyArray = key.split(':');
        self.num = parseInt(keyArray[1]);
        self.creator = reply.creator;
        self.type = reply.type;
        self.createdTime = reply.createdTime;
        self.open = reply.open;
        return self;
      })
      .catch(function (err) {
        logger.error('Ticket.getTicket had an err returned from redis', err);
        return new Error(err.toString());
      });
      // return deferred.promise;

    },

    // Add a topic to this ticket. Creates topic object, saves to database.
    // Returns topic object
    addTopic: function addTopic(topicName, dataType, content, numbered) {
      var self = this,
      // Create the topic object
          topic = topicFactory({
            parent: self,
            type: self.type,
            name: topicName,
            dataType: dataType
          });
      logger.debug('models/Ticket.addTopic. Content is ', content);
      // Check to see if it already exists
      return topic.exists()
      .then(function (reply) {
        logger.debug('models/Ticket.addTopic. Reply from topic.exists is ', reply);
        if (!reply) {
          logger.debug('models/Ticket.addTopic. Topic does not exist. Save it. ');
          return topic.save(content).then(function (reply) {
            // Add the topic key to the sorted set of keys
            // The score is the created timestamp, so we don't need to save that
            // elsewhere - can get the score from the set
            logger.debug('models/Ticket.addTopic. Reply from create is ', reply);
            logger.debug('models/Ticket.addTopic topicListKey is ', keyGen.topicListKey(self));
            logger.debug('models/Ticket.addTopic topic key is ', keyGen.topicKey(topic));
            logger.debug('models/Ticket.addTopic timestamp is ', dimsUtils.createTimestamp());
            return db.zadd(keyGen.topicListKey(self), dimsUtils.createTimestamp(), keyGen.topicKey(topic));
          })
          .then(function (reply) {
            logger.debug('models/Topic.addTopic. Final reply from add to set is ', reply, ', Now resolve with topic');
            return topic;
          })
          .catch(function (err) {
            logger.error('models/Ticket.addTopic had an err returned from redis', err, reply);
            return new Error(err.toString());
          });
        } else {
          logger.debug('models/Ticket.addTopic. Topic already exists. Return rejection to caller ');
          return new Error('Topic already exists.');
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
      .catch(function (err, reply) {
        logger.error('Ticket.getTopics had an err returned from redis', err);
        return new Error (err.toString());
      });
    },

    // Get keys of all topics attached to this ticket
    getTopicKeys: function getTopicKeys() {
      var self = this;
      // Get the keys
      return db.zrange(keyGen.topicListKey(self), 0, -1)
      .then(function (reply) {
        logger.debug('Ticket.getTopicKeys reply', reply);
        return reply;
      })
      .catch(function (err) {
        logger.error('models/Ticket.getTopicKeys had an err returned from redis', err);
        return new Error(err.toString());
      });
    },

    // Construct topic object from a topic key
    topicFromKey: function topicFromKey(key) {
      var self = this;
      // Create a new topic object
      var topic = topicFactory({
        parent: self,
        type: self.type,
        name: extract.topicName(key, keyGen.ticketKey(self))
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
        return new Error(err.toString());
      });
    },

    // Returns metadata of object as a string
    paramString: function paramString() {
      var self = this;
      return self.num + ',' + self.type + ',' + self.creator + ',' + self.createdTime + ',' + self.open;
    },

    getTopicFullName: function getTopicFullName(name, num) {
      return name + '.' + num;
    }
  };

  var topicPrototype = {
    // Save some content and optional score to db
    // for current topic object - was create
    save: function save(content, score) {
      logger.debug('models/Topic.save ', content, score);
      var self = this;
      // save the data
      return db.setData(keyGen.topicKey(self), self.dataType, content, score).then(function (reply) {
        return reply;
      })
      .catch(function (err) {
        logger.error('models/Topic.setData had an err returned from redis', err);
        return new Error (err.toString());
      });
    },

    // Set the dataType in the topic object. Used to get the value from
    // database to put in object
    setDataType: function setDataType(dataType) {
      var self = this;
      self.dataType = dataType;
    },

    // Get the stored dataType for this topic object by key
    getDataType: function getDataType() {
      var self = this;
      logger.debug('models/Topic.getDataType topic key is ', keyGen.topicKey(self));
      return db.type(keyGen.topicKey(self))
      .then (function (reply) {
        logger.debug('models/Topic.getDataType reply is ', reply);
        return reply;
      })
      .catch(function (err) {
        return new Error(err.toString());
      });
    },

    // Return the metadata for the current topic
    getTopicMetadata: function getTopicMetadata() {
      var self = this,
          config = {
            parent: self.parent,
            type: self.type,
            name: self.name,
            dataType: self.dataType
          };
      // config.description = self.description;
      // config.shortDesc = self.shortDesc;
      return config;
    },

    // Get readable name of topic
    getName: function getName() {
      var self = this;
      return self.type + ':' + self.name;
    },

    // Get the topic contents stored at the topic key
    getContents: function getContents() {
      var self = this;
      // Get the stored dataType
      return self.getDataType()
      .then(function (reply) {
        self.dataType = reply; // side effect - do we need this
        // Get the data as per the topic key and datatype
        return db.getAllData(keyGen.topicKey(self), self.dataType);
      })
      .then(function (reply) {
        logger.debug('models/ticket.topic.getContents reply from getAllContents is ', reply);
        return reply;
      })
      .catch(function (err) {
        return new Error(err.toString());
      });
    },

    // Does this topic already exist in the database for this ticket?
    exists: function exists() {
      var self = this;
      return db.zrank(keyGen.topicListKey(self.parent), keyGen.topicKey(self)).then(function (reply) {
        logger.debug('models/ticket.topicPrototype.exists. reply from zrank ', reply);
        if (reply === null || reply === 'undefined') {
          logger.debug('models/ticket.topicPrototype.exists. Topic does not exist. Resolve with false ');
          return false;
        } else {
          logger.debug('models/ticket.topicPrototype.exists. Topic exists. Resolve with true ');
          return true;
        }
      })
      .catch(function (err) {
        logger.error('models/ticket.topicPrototype.exists had an err returned from redis', err);
        return new Error (err.toString());
      });
    },

    // Get the timestamp stored at the topic timestamp key
    getTimeStamp: function getTimeStamp() {
      var self = this,
          deferred = q.defer();
      // Get the value stored at the timestampkey
      return db.get(keyGen.topicTimestampKey(self)).then(function (reply) {
        return reply;
      })
      .catch(function (err) {
        logger.error('models/Topic.getTimeStamp had an err returned from redis', err);
        return new Error (err.toString());
      });
    },

    // Used in debugging
    paramString: function paramString() {
      var self = this,
          contents, timestamp;
      return self.getContents().then(function (reply) {
        contents = reply;
        return self.getTimeStamp();
      })
      .then(function (reply) {
        timestamp = reply;
        return (self.getName() + ',' + timestamp + '->' + contents);
      })
      .catch(function (err) {
        logger.error('models/Topic.paramstring had an err returned from redis', err);
        return new Error (err.toString());
      });
    }

  };

  // Factory function to create an unsaved ticket object
  var ticketFactory = function ticketFactory(options) {
    if (options === null || options === undefined) {
      return (_.extend({}, ticketPrototype, initialTicketConfig));
    } else {
      return (_.extend({}, ticketPrototype, options));
    }
  };

  // Factory function to create an unsaved topic object
  // Options: parent, type, name, dataType, shortDesc, description
  var topicFactory = function topicFactory(options) {
    return (_.extend({}, topicPrototype, options));
  };

  // This is what we're exposing
  var ticket = {

    // Factory to create an empty ticket object
    ticketFactory: ticketFactory,

    // Factory to create topic object
    topicFactory: topicFactory,

    // Static method to return a ticket object populated from the
    // database for a given key
    getTicket: function getTicket(key) {
      // var deferred = q.defer();
      return db.hgetall(key).then(function (reply) {
        // Note: set num to integer since it derives from key, which is a string
        config = {
          num: parseInt(key.split(c.delimiter)[1]),
          creator: reply.creator,
          type: reply.type,
          createdTime: reply.createdTime,
          open: reply.open
        };
        return ticketFactory(config);
      })
      .catch(function (err) {
        logger.error('Ticket.getTicket had an err returned from redis', err);
        return err.toString();
      });
      // return deferred.promise;
    },

    // Static method to return array of keys for all tickets
    // was getAllTickets
    getAllTicketKeys: function getAllTicketKeys() {
      logger.debug('Ticket.getAllTicketKeys ticketsetkey is ', keyGen.ticketSetKey());
      return db.zrange(keyGen.ticketSetKey(), 0, -1).then(function (reply) {
        return reply;
      })
      .catch(function (err, reply) {
        logger.error('Ticket.getAllTickets had an err returned from redis', err, reply);
        return new Error(err.toString());
      });
    }
  }

  return ticket;
};

