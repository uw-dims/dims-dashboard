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
  // Increment the ticket counter and save as num
  var ticketCounterKey = KeyGen.ticketCounterKey();
  self.client.incr(ticketCounterKey, function(err,data) {
    if (err) deferred.reject(err);
    else {
      // self.num is number (integer)
      self.num = data;
      // Get the key for the ticket
      var key = KeyGen.ticketKey(self);
      // Set the value of the key to default
      self.client.set(key, '', function(err, data) {
        // Add key to the set of ticket keys
        if (err) deferred.reject(err);
        else {
          self.client.sadd(KeyGen.ticketSetKey(), key, function(err, data) {
            if (err) deferred.reject(err);
            else deferred.resolve(self);
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
    if (err) deferred.reject(err);
    else {
      // Get the key for the list of topics for this ticket
      var topicListKey = KeyGen.topicListKey(self);
      // Push the "full name" of the topic on the list of topics
      self.client.rpush(topicListKey, self.getTopicFullName(topicName,topicCounterValue));
      // Create the topic
      var topic = new Topic(self,topicName,topicCounterValue);
      // Generate the topicKey
      var topicKey = KeyGen.topicKey(topic);
      // Store the contents
      self.client.hmset(topicKey, contents);
      // Get the key for the timestamp for this topic
      var topicTimeStampKey = KeyGen.topicTimeStampKey(topic);
      // Generate the current time
      var now = new Date().getTime();
      var secsSinceEpoch = Math.floor(now/1000);
      self.client.set(topicTimeStampKey, secsSinceEpoch.toString());
      // promise will return the topic
      deferred.resolve(topic);
    }
  });
  return deferred.promise; 
};

// This doesn't work yet - need to work on how promises are used in a for loop
Ticket.prototype.getTopics = function() {
  var self = this;
  var deferred = q.defer();
  // Get the key for the list of topics for this ticket
  var topicListKey = KeyGen.topicListKey(self);
  // Get the length of the list of topics
  var topicCount = self.client.llen(topicListKey);
  var topics = [];
  var topicsRetrieved = 0;
  for (var i=0; i < topicCount; i++) {

    // Get the topic full name at the current index of the list
    var topicFullName = self.client.lindex(topicListKey, i);
    var nameArray = topicFullName.split('.');
    // Maybe check for not equal to 2 here?
    if (nameArray.length < 2) {
      logger.warn('Ticket.getTopics: Invalid topic full name ', topicFullName);
      continue; // Skip this topic
    }
    var topicNum = parseInt(nameArray[1]);
    if (isNaN(topicNum)) {
      logger.warn('Ticket.getTopics: Invalid counter ', nameArray[1]);
      continue;
    }
    var topic = new Topic (nameArray[0], topicNum);
    topics.push(topic);
  }
  return topics;

};

Ticket.prototype.paramString = function() {
  var self = this;
  return self.num + ',' + self.name;
};

Ticket.prototype.getTopicFullName = function(name, num) {
  return name+'.'+num;
};