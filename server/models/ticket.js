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
var redisUtils = require('../utils/redisUtils');

exports = module.exports = Ticket;

// constructor
function Ticket() {
	var self = this;
  // Construct a config with ticket metadata
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
      deferred.reject(err.toString());
  });
  return deferred.promise;
};


Ticket.prototype.create = function(context) {
  var self = this;
  var deferred = q.defer();
  // Process arguments in context object
  var args = context || {};
  self.creator = args.creator || '';
  self.type = args.type || '';
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
    logger.debug('Ticket.create had an err returned from redis', err, reply);
    deferred.reject(err.toString());
  });
  return deferred.promise;
};

// Add a topic to the ticket
Ticket.prototype.addTopic = function(topicName, dataType, content, numbered) {
  var self = this;
  var deferred = q.defer();
  // Create the topic object
  var topic = new Topic(self, self.type, topicName, dataType);
  // Save the topic
  topic.create(content)
    .then(function(reply) {
      // Add the topic key to the sorted set of keys
      // The score is the created timestamp, so we don't need to save that
      // elsewhere - can get the score from the set
      return db.zadd(KeyGen.topicListKey(self), dimsUtils.createTimestamp(), KeyGen.topicKey(topic));
  })
    .then(function(reply) {
      deferred.resolve(topic);
  }, function(err, reply) {
    logger.debug('Ticket.addTopic had an err returned from redis', err, reply);
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
      
    });
  return deferred.promise;
};

// Derive topic object from its key 
Ticket.prototype.topicFromKey = function(key) {
  var self = this;
  var deferred = q.defer();
  var ticketKey = KeyGen.ticketKey(self);
  // Remove the parent key
  var topicInfo = key.replace(ticketKey, '');
  topicInfo = topicInfo.substring(1, topicInfo.length);
  var topicData = topicInfo.split(c.delimiter);
  var topic = new Topic(self, self.type, topicData[1]);
  topic.getDataType()
    .then(function(reply) {
      topic.setDataType(reply);
      deferred.resolve(topic);
    }, function(err, reply) {
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

