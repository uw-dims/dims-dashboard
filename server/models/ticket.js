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

  var ticketPrototype = {

    close: function close() {
      var self = this;
      self.metadata.open = false;
      self.metadata.modifiedTime = timestamp();
      return self.exists()
      .then(function (reply) {
        if (reply) {
          return store.setMetadata(keyGen.ticketKey(self), self.getTicketMetadata());
        } else {
          return new Error('Cannot close a ticket that does not exist');
        }
      })
      .catch(function (err) {
        logger.error('models/Ticket.create had an err returned from redis', err);
        return new Error(err.toString());
      });
    },

    open: function open() {
      var self = this;
      self.metadata.open = true;
      self.metadata.modifiedTime = timestamp();
      return self.exists()
      .then(function (reply) {
        if (reply) {
          return store.setMetaData(keyGen.ticketKey(self), self.getTicketMetadata());
        } else {
          return new Error('Cannot open a ticket that does not exist');
        }
      })
      .catch(function (err) {
        logger.error('models/Ticket.create had an err returned from redis', err);
        return new Error(err.toString());
      });
    },

    exists: function exists() {
      var self = this;
      return store.existsInSet(keyGen.ticketKey(self), keyGen.ticketSetKey());
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
          store.addKeyToSet(keyGen.ticketKey(self.metadata), keyGen.ticketSetKey()),
          store.addKeyToSet(keyGen.ticketKey(self.metadata), keyGen.ticketOwnerKey(self.metadata)),
          store.addKeyToSet(keyGen.ticketKey(self.metadata), keyGen.ticketOpenKey()),
          store.addKeyToSet(keyGen.ticketKey(self.metadata), keyGen.ticketTypeKey(self.metadata.type))
        ]);
      })
      .catch(function (err) {
        logger.error('models/Ticket.create had an err returned from redis', err);
        return new Error(err.toString());
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
      .catch(function (err) {
        logger.error('Ticket.getTopics had an err returned from redis', err);
        return new Error (err.toString());
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
      logger.debug('ticket key is ', keyGen.ticketKey(self));
      var topic = topicFactory({
        parent: self,
        type: self.type,
        name: keyExtract.topicName(key, keyGen.ticketKey(self))
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

  // Factory function to create an unsaved topic object
  // Options: parent, type, name, dataType, shortDesc, description
  // var topicFactory = function topicFactory(options) {
  //   return (_.extend({}, topicPrototype, options));
  // };

  // This is what we're exposing
  var ticket = {

    // Factory to create a new ticket object
    ticketFactory: ticketFactory,

    // Static method to return a ticket object populated from the
    // database for a given key
    getTicket: function getTicket(key) {
      var thisKey = key;
      return store.getMetaData(key)
      .then(function (reply) {
        // Note: set num to integer since it derives from key, which is a string
        config = {
          num: keyExtract.ticketNum(thisKey),
          creator: reply.creator,
          type: reply.type,
          createdTime: _.parseInt(reply.createdTime),
          modifiedTime: _.parseInt(reply.modifiedTime),
          open: reply.open === 'true' ? true : false
        };
        return ticketFactory(config);
      })
      .catch(function (err) {
        logger.error('Ticket.getTicket had an err returned from redis', err);
        return err.toString();
      });
    }

    // Static method to return array of keys for all tickets
    // getAllTicketKeys: function getAllTicketKeys() {
    //   logger.debug('Ticket.getAllTicketKeys ticketsetkey is ', keyGen.ticketSetKey());
    //   return db.zrangeProxy(keyGen.ticketSetKey(), 0, -1).then(function (reply) {
    //     return reply;
    //   })
    //   .catch(function (err, reply) {
    //     logger.error('Ticket.getAllTickets had an err returned from redis', err, reply);
    //     return new Error(err.toString());
    //   });
    // }
  };

  // var topicPrototype = {
  //   // Save content (string)
  //   save: function save(content) {
  //     var self = this;
  //     logger.debug('models/ticket.js topic save ', content, score, self.dataType);
  //     // save the data
  //     return store.setData(keyGen.topicKey(self), content);
  //   },

  //   // Set the dataType in the topic object. Used to get the value from
  //   // database to put in object
  //   setDataType: function setDataType(dataType) {
  //     var self = this;
  //     self.dataType = dataType;
  //   },

  //   // Get the stored dataType for this topic object by key
  //   getDataType: function getDataType() {
  //     var self = this;
  //     logger.debug('models/Topic.getDataType topic key is ', keyGen.topicKey(self));
  //     return db.typeProxy(keyGen.topicKey(self))
  //     .then (function (reply) {
  //       logger.debug('models/Topic.getDataType reply is ', reply);
  //       return reply;
  //     })
  //     .catch(function (err) {
  //       return new Error(err.toString());
  //     });
  //   },

  //   // Return the metadata for the current topic
  //   getTopicMetadata: function getTopicMetadata() {
  //     var self = this,
  //         config = {
  //           parent: self.parent,
  //           type: self.type,
  //           name: self.name,
  //           dataType: self.dataType
  //         };
  //     // config.description = self.description;
  //     // config.shortDesc = self.shortDesc;
  //     return config;
  //   },

  //   // Get readable name of topic
  //   getName: function getName() {
  //     var self = this;
  //     return self.type + ':' + self.name;
  //   },

    // Get the topic contents stored at the topic key
    // getContents: function getContents() {
    //   var self = this;
    //   // Get the stored dataType
    //   return self.getDataType()
    //   .then(function (reply) {
    //     self.dataType = reply; // side effect - do we need this
    //     logger.debug('getContents datatype = ', reply);
    //     logger.debug('topic key is ', keyGen.topicKey(self));
    //     // Get the data as per the topic key and datatype
    //     return db.getData(keyGen.topicKey(self), self.dataType);
    //   })
    //   .then(function (reply) {
    //     logger.debug('models/ticket.topic.getContents reply from getAllContents is ', reply);
    //     return reply;
    //   })
    //   .catch(function (err) {
    //     return new Error(err.toString());
    //   });
    // },

    // Does this topic already exist in the database for this ticket?
    // exists: function exists() {
    //   var self = this;
    //   return db.zrankProxy(keyGen.topicSetKey(self.parent), keyGen.topicKey(self)).then(function (reply) {
    //     logger.debug('models/ticket.topicPrototype.exists. reply from zrank ', reply);
    //     if (reply === null || reply === 'undefined') {
    //       logger.debug('models/ticket.topicPrototype.exists. Topic does not exist. Resolve with false ');
    //       return false;
    //     } else {
    //       logger.debug('models/ticket.topicPrototype.exists. Topic exists. Resolve with true ');
    //       return true;
    //     }
    //   })
    //   .catch(function (err) {
    //     logger.error('models/ticket.topicPrototype.exists had an err returned from redis', err);
    //     return new Error (err.toString());
    //   });
    // },

    // Get the timestamp stored at the topic timestamp key
    // getTimeStamp: function getTimeStamp() {
    //   var self = this;
    //   // Get the value stored at the timestampkey
    //   return db.getProxy(keyGen.topicTimestampKey(self)).then(function (reply) {
    //     return reply;
    //   })
    //   .catch(function (err) {
    //     logger.error('models/Topic.getTimeStamp had an err returned from redis', err);
    //     return new Error (err.toString());
    //   });
    // },

    // Used in debugging
    // paramString: function paramString() {
    //   var self = this,
    //       contents, timestamp;
    //   return self.getContents().then(function (reply) {
    //     contents = reply;
    //     return self.getTimeStamp();
    //   })
    //   .then(function (reply) {
    //     timestamp = reply;
    //     return (self.getName() + ',' + timestamp + '->' + contents);
    //   })
    //   .catch(function (err) {
    //     logger.error('models/Topic.paramstring had an err returned from redis', err);
    //     return new Error (err.toString());
    //   });
    // }

  // };

  // If testing, export some private functions
  if (process.env.NODE_ENV === 'test') {
    ticket._private = {
      castMetadata: castMetadata,
      validateConfig: validateConfig
    };
  }

  return ticket;
};

