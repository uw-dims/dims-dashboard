'use strict';

// ticket model
var config = require('../config');
var c = require('../config/redisScheme');
var keyGen = require('./keyGen');
var logger = require('../utils/logger');
var q = require('q');

exports = module.exports = Topic;

// parent: parent Ticket
// name: name of topic
// num: topic counter
function Topic(parent, name, num) {
  var self = this;
  self.parent = parent;
  self.name = name;
  self.num = num
};

// Return name.counter
Topic.prototype.getName = function() {
  var self = this;
  return self.name + '.' + self.num;
};

// Get the contents of the hash (fields, values) stored at topic key
Topic.prototype.getContents = function() {
  var self = this;
  // Get the key for this topic
  var key = keyGen.topicKey(self);
  // Return all fields and values in the hash
  return self.parent.client.hgetAll(key);
};

// Get the timestamp stored at the topic timestamp key
Topic.prototype.getTimeStamp = function() {
  var self = this;
  // Get the key for the topic timestamp
  var key = keyGen.topicTimestampKey(self);
  // Get the value stored at the timestampkey
  var timestamp = self.parent.client.get(key);
  return timestamp;
};

// Used in debugging
Topic.prototype.paramString = function() {
  var self = this;
  return self.getName() + ',' + self.getTimeStamp() + ' -> ' + self.getContents();
};
