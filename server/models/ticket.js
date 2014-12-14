'use strict';

/** 
  * file: models/ticket.js
  */

var config = require('../config');
var c = require('../config/redisScheme');
var KeyGen = require('./keyGen');
var logger = require('../utils/logger');
var Topic = require('./topic');
var q = require('q');
var redisDB = require('../utils/redisDB');
var db = require('../utils/redisUtils');
var dimsUtils = require('../utils/util');

exports = module.exports = Ticket;

// constructor
function Ticket() {
	var self = this;
  // Not doing anything in constructor right now
};

// Get metadata from ticket and put in config
Ticket.prototype.getTicketMetadata = function() {
    var config = {},
        self = this;
    config.num = self.num;
    config.creator = self.creator;
    config.type = self.type;
    config.createdTime = self.createdTime;
    config.open = self.open;
    return config;
  };

// Populate a ticket object with its stored metadata
Ticket.prototype.getTicket = function(key) {
  var self = this;
  var deferred = q.defer();
  db.hgetall(key).then(function(reply) {
      var keyArray = key.split(':');
      self.num = keyArray[1];
      self.creator = reply.creator;
      self.type = reply.type;
      self.createdTime = reply.createdTime;
      self.open = reply.open;
      deferred.resolve(self);
  }, function(err, reply) {
      logger.error('Ticket.getTicket had an err returned from redis', err, reply);
      deferred.reject(err.toString());
  });
  return deferred.promise;
};


// Get an array of all tickets
Ticket.prototype.getAllTickets = function() {
  var self = this;
  var deferred = q.defer();
  db.zrange(KeyGen.ticketSetKey(), 0, -1).then(function(reply) {
    deferred.resolve(reply);
  }, function(err, reply) {
      logger.error('Ticket.getAllTickets had an err returned from redis', err, reply);
      deferred.reject(err.toString());
  });
  return deferred.promise;
};

// Create a ticket and save metadata
Ticket.prototype.create = function(type, creator) {
  logger.debug('models/Ticket.create start');
  var self = this;
  var deferred = q.defer();
  self.creator = creator;
  self.type = type;
  self.open = true;
  self.createdTime = dimsUtils.createTimestamp();
  // Get the counter key
  var ticketCounterKey = KeyGen.ticketCounterKey();
  var key, value;
  // Increment the ticket counter 
  db.incr(ticketCounterKey)
  .then(function(reply) {
    // Save it
    self.num = reply;
    // Get the ticket key
    key = KeyGen.ticketKey(self);
    // Get metadata
    value = self.getTicketMetadata();
    // Save the data to datastore
    return db.hmset(key, value);
  })
  .then(function(result) {
    // Add the key to the sorted set of tickets. score is created time
    return db.zadd(KeyGen.ticketSetKey(), self.createdTime, key);
  })
  .then(function(reply) {
    // return the newly created ticket
    deferred.resolve(self);
  }, function(err, reply) {
    logger.error('models/Ticket.create had an err returned from redis', err, reply);
    deferred.reject(err.toString());
  });
  return deferred.promise;
};

// Add a topic to the ticket and save contents
Ticket.prototype.addTopic = function(topicName, dataType, content, numbered) {
  var self = this;
  var deferred = q.defer();
  // Create the topic object
  var topic = new Topic(self, self.type, topicName, dataType);
  logger.debug('models/Ticket.addTopic. Content is ', content);
  // Check to see if it already exists
  topic.exists().then(function(reply){
    logger.debug('models/Ticket.addTopic. Reply from topic.exists is ', reply);
    if (reply) { 
      logger.debug('models/Ticket.addTopic. Topic already exists. Return rejection to caller ');
      return deferred.reject('Topic already exists.');
    }
    else { 
      logger.debug('models/Ticket.addTopic. Topic does not exist. Create it. ');
      topic.create(content). then(function(reply) {
          // Add the topic key to the sorted set of keys
          // The score is the created timestamp, so we don't need to save that
          // elsewhere - can get the score from the set
          logger.debug('models/Ticket.addTopic. Reply from create is ', reply);
          return db.zadd(KeyGen.topicListKey(self), dimsUtils.createTimestamp(), KeyGen.topicKey(topic));
      })
        .then(function(reply) {
          logger.debug('models/Topic.addTopic. Final reply from add to set is ', ', Now resolve with topic');
          deferred.resolve(topic);
      }, function(err, reply) {
          logger.error('models/Ticket.addTopic had an err returned from redis', err, reply);
          deferred.reject(err.toString());
      }); 
    }
  }, function(err, reply) {
          logger.error('models/Ticket.addTopic had an err returned from redis', err, reply);
          deferred.reject(err.toString());
      }); 
    
  return deferred.promise; 
};

// Get all the topic keys for this ticket. Returns a promise with an array of topic keys
Ticket.prototype.getTopicKeys = function() {
  var self = this;
  var deferred = q.defer();
  // Get the keys
  db.zrange(KeyGen.topicListKey(self), 0, -1)
  .then(function(reply){
      deferred.resolve(reply);
    }, function(err, reply) {
      logger.error('models/Ticket.getTopicKeys had an err returned from redis', err, reply);
      deferred.reject(err.toString());
    });
  return deferred.promise;
};

// Get all the topics in a ticket. Returns a promise with an array of topics.
// This does not retrieve the topic content
Ticket.prototype.getTopics = function() {
  var self = this;
  var deferred = q.defer();
  var topics = [];
  var promises = [];
  // 
  self.getTopicKeys()
  .then(function(topicKeys) {
      for (var i=0; i< topicKeys.length; i++) {
        var topicPromise = self.topicFromKey(topicKeys[i]);
        promises.push(topicPromise);
      }
      q.all(promises).then(function(array) {
        topics = array;
        deferred.resolve(topics);
      });
      
    }, function(err, reply) {
      logger.error('Ticket.getTopics had an err returned from redis', err, reply);
      deferred.reject(err.toString());
    });
  return deferred.promise;
};

// Derive topic object from its key 
Ticket.prototype.topicFromKey = function(key) {
  var self = this;
  var deferred = q.defer();
  var ticketKey = KeyGen.ticketKey(self);
  logger.debug('Ticket.topicFromKey: ticketKey is', ticketKey);
  // Remove the parent key
  var index = ticketKey.length + 1;
  var topicInfo = key.substring(index, key.length);
  logger.debug('Ticket.topicFromKey: topicInfo is ', topicInfo);
  var topicData = topicInfo.split(c.delimiter);
  logger.debug('Ticket.topicFromKey: topicData is ', topicData);
  index = topicData[0].length +1;
  var topicName = topicInfo.substring(index, topicInfo.length);
  logger.debug('Ticket.topicFromKey: topicName is ', topicName);
  var topic = new Topic(self, self.type, topicName);
  logger.debug('Ticket.topicFromKey: topic is ', topic);
  topic.getDataType()
    .then(function(reply) {
      logger.debug('Ticket.topicFromKey:reply from getDataType ', reply);
      topic.setDataType(reply);
      logger.debug('ticket.topicFromKey datatype ', topic.dataType);
      deferred.resolve(topic);
    }, function(err, reply) {
      logger.error('Ticket.topicFromKey had an err returned from redis', err, reply);
      deferred.reject(err.toString());
    });
  return deferred.promise;
};

Ticket.prototype.paramString = function() {
  var self = this;
  return self.num + ',' + self.type + ',' + self.creator + ',' + self.createdTime + ',' + self.open;
};

Ticket.prototype.getTopicFullName = function(name, num) {
  return name+'.'+num;
};

