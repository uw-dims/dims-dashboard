'use strict';

// ticket model
var config = require('../config');
var c = require('../config/redisScheme');
var KeyGen = require('./keyGen');
var logger = require('../utils/logger');
var Topic = require('./topic');
var q = require('q');
var redis = require('redis');

exports = module.exports = Ticket;

function Ticket(client, user) {
	var self = this;
  // redis client
	self.client = client;
  // logged in user
	self.name = user;
};

Ticket.prototype.create = function() {
  var self = this;
  var deferred = q.defer();
  var ticketCounterKey = KeyGen.ticketCounterKey();
  // Increment the ticket counter and save as number
  self.client.incr(ticketCounterKey, function(err,data) {
    if (err) { 
      deferred.reject(err);
    } else {
      // self.num is number (integer)
      self.num = data;
      // Get the key for the ticket
      var key = KeyGen.ticketKey(self);
      // Set the value of the key to default
      self.client.set(key, '', function(err, data) {
        if (err) { 
          deferred.reject(err); 
        } else {
          // Add the key to the set of ticket keys
          self.client.sadd(KeyGen.ticketSetKey(), key, function(err, data) {
            if (err) {
              deferred.reject(err);
            } else {
              deferred.resolve(self);
            }
          });
        }
      });
    }
  });
  return deferred.promise;
};

Ticket.prototype.addTopic = function(topicName, contents) {
  var self = this;
  var deferred = q.defer();
  // Increment the topic counter
  var topicCounterKey = KeyGen.topicCounterKey(self, topicName);
  self.client.incr(topicCounterKey, function(err,data) {
    if (err) { deferred.reject(err); }
    else {
      // Date returned is value of the counter
      var topicCounterValue = data;
      // Get the key for the list of topics for this ticket
      var topicListKey = KeyGen.topicListKey(self);
      // Push the "full name" of the topic on the list of topics
      self.client.rpush(topicListKey, self.getTopicFullName(topicName,topicCounterValue), function(err, data) {
        if (err) deferred.reject(err);
        else {
          var topic = new Topic(self,topicName,topicCounterValue);
          // Generate the topicKey
          var topicKey = KeyGen.topicKey(topic);
          // Store the contents
          self.client.hmset(topicKey, contents, function(err, data) {
            if (err) { deferred.reject(err); }
            else {
              // Get the key for the timestamp for this topic
              var topicTimestampKey = KeyGen.topicTimestampKey(topic);
              // Generate the current time
              var now = new Date().getTime();
              var secsSinceEpoch = Math.floor(now/1000);
              self.client.set(topicTimestampKey, secsSinceEpoch.toString(), function(err,data) {
                // promise will return the topic
                if (err) { deferred.reject(err); }
                else {
                  deferred.resolve(topic);
                }  
              });
            }  
          });
        }
      });
    }
  });
  return deferred.promise; 
};

// Get all the topic names for this ticket. Returns a promise with an array of topic names
Ticket.prototype.getTopicNames = function() {
  logger.debug('Ticket.getTopicNames');
  var self = this;
  var deferred = q.defer();
  // Get the key for the list of topics for this ticket
  var topicListKey = KeyGen.topicListKey(self);
  self.client.lrange(topicListKey, 0, -1, function(err, data) {
    if (err) { 
      logger.debug('Ticket.getTopicNames: error ', err);
      deferred.reject(err); }
    else {
      logger.debug('Ticket.getTopicNames: data is ', data);
      deferred.resolve(data);
    }
  });
  return deferred.promise;
};

// Get all the topics in a ticket. Returns a promise with an array of topics.
Ticket.prototype.getTopics = function() {
  logger.debug('Ticket.getTopics');
  var self = this;
  var deferred = q.defer();
  var topics = [];
  var topicsRetrieved = 0;

  self.getTopicNames().then(function(topicNames) {
      for (var i=0; i< topicNames.length; i++) {
        var nameArray = topicNames[i].split('.');
        if (nameArray.length < 2) {
          logger.warn('Ticket.getTopics: Invalid topic full name ', topicNames[i]);
          continue; // Skip this topic
        }
        var topicNum = parseInt(nameArray[1]);
        if (isNaN(topicNum)) {
          logger.warn('Ticket.getTopics: Invalid counter ', nameArray[1]);
          continue;
        }
        var topic = new Topic (self, nameArray[0], topicNum);
        topics.push(topic);
      }
      deferred.resolve(topics);
    });
  return deferred.promise;
};

Ticket.prototype.paramString = function() {
  var self = this;
  return self.num + ',' + self.name;
};

Ticket.prototype.getTopicFullName = function(name, num) {
  return name+'.'+num;
};