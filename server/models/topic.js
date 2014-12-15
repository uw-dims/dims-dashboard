'use strict';

// topic model
var config = require('../config');
var c = require('../config/redisScheme');
var KeyGen = require('./keyGen');
var logger = require('../utils/logger');
var q = require('q');
var db = require('../utils/redisUtils');


exports = module.exports = Topic;

// parent: parent Ticket
// name: name of topic
// type: type of ticket/topic
function Topic(parent,type,name,dataType,shortDesc, description) {
  var self=this;
  self.parent = parent;
  self.type = type;
  self.name = name;
  self.dataType = dataType || 'hash';
  // self.description = description;
  // self.shortDesc = shortDesc;
};

Topic.prototype.setDataType = function(dataType) {
  var self = this;
  self.dataType = dataType;
};

Topic.prototype.getDataType = function() {
  var self = this;
  var deferred = q.defer();
  logger.debug('models/Topic.getDataType topic key is ', KeyGen.topicKey(self));
  logger.debug('models/Topic.getDataType self is ', self);
  db.type(KeyGen.topicKey(self))
  .then (function(reply) {
    logger.debug('models/Topic.getDataType reply is ', reply);
    deferred.resolve(reply);
  }, function(err, reply) {
    deferred.reject(err.toString());
  });
  return deferred.promise;
};

Topic.prototype.getTopicMetadata = function() {
  var self = this,
      config = {};
  config.parent = self.parent;
  config.type = self.type;
  config.name = self.name;
  config.dataType = self.dataType;
  // config.description = self.description;
  // config.shortDesc = self.shortDesc;
  return config;
};

// Return readable name
Topic.prototype.getName = function() {
  var self = this;
  return self.type + ':' + self.name;
};

// Get the contents stored at topic key
Topic.prototype.getContents = function() {
  var self = this;
  var deferred = q.defer();
  // Get the key for this topic
  var key = KeyGen.topicKey(self);
  self.getDataType().then(function(reply) {
    self.dataType = reply;
    return db.getAllData(key, self.dataType);
  })
  .then(function(reply) {
    deferred.resolve(reply);
  }, function(err, reply) {
    deferred.reject(err.toString());
  });
  return deferred.promise;
};

// Save a new topic
Topic.prototype.create = function(content, score) {
  var self = this;
  var deferred = q.defer();
  // save the data
  self.setData(content, score)
  .then(function(reply) {

    deferred.resolve(reply);
  }, function(err, reply) {
    logger.error('models/Topic.create had an err returned from redis', err, reply);
    deferred.reject(err.toString());
  });
  return deferred.promise;
};

Topic.prototype.setData = function(content, score) {
  var self = this;
  var deferred = q.defer();
  db.setData(KeyGen.topicKey(self), self.dataType, content, score).then(function(reply) {
    deferred.resolve(reply);
  }, function(err, reply) {
    logger.error('models/Topic.setData had an err returned from redis', err, reply);
    deferred.reject(err.toString());
  });
  return deferred.promise;
};

Topic.prototype.exists = function() {
  var self = this;
  var deferred = q.defer();
  db.zrank(KeyGen.topicListKey(self.parent), KeyGen.topicKey(self)).then(function(reply) {
    logger.debug('models/Topic.exists. reply from zrank ', reply);
    if (reply === null || reply === 'undefined') {
      logger.debug('models/Topic.exists. Topic does not exist. Resolve with false ');
      deferred.resolve(false);
    }
    else { 
      logger.debug('models/Topic.exists. Topic exists. Resolve with true ');
      deferred.resolve(true);
    }
  }, function(err, reply) {
    logger.error('models/Topic.exists had an err returned from redis', err, reply);
    deferred.reject(err.toString());
  });
  return deferred.promise;
};

// Add incremented counter to the topic key
// Not all topics need a counter 
Topic.prototype.addCounter = function() {

};

// Get the timestamp stored at the topic timestamp key
Topic.prototype.getTimeStamp = function() {
  var self = this;
  var deferred = q.defer();
  // Get the key for the topic timestamp
  var key = KeyGen.topicTimestampKey(self);
  // Get the value stored at the timestampkey
  db.get(key).then(function(reply) {
    deferred.resolve(reply);
  }, function(err, reply) {
    logger.error('models/Topic.getTimeStamp had an err returned from redis', err, reply);
    deferred.reject(err.toString());
  });
  return deferred.promise;
};

// Used in debugging
Topic.prototype.paramString = function() {
  var self = this;
  var deferred = q.defer();
  var contents, timestamp;
  self.getContents().then(function(reply) {
    contents = reply;
    return self.getTimeStamp();
  })
  .then(function(reply) {
    timestamp = reply;
    q.resolve(self.getName() + ',' + timestamp + '->' + contents);
  }, function(err, reply) {
    logger.error('models/Topic.paramstring had an err returned from redis', err, reply);
      deferred.reject(err.toString());
  });
  return deferred.promise;
};
