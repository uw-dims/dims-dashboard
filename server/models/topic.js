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

var keyGen = require('./keyGen'),
    logger = require('../utils/logger')(module),
    _ = require('lodash-compat'),
    q = require('q');

module.exports = function Topic(store) {

  var timestamp = function () {
    var now = new Date().getTime();
    return now;
  };

  var sanitizeName = function sanitizeName(name) {
    //TODO
  };

  var topicTypes = {
    'set': {
      name: 'set'
    },
    'string': {
      name: 'string'
    }
  };

  var validOptions = {
    datatype: 'datatype',
    name: 'name',
    description: 'description'
  };

  // Return true if type is valid
  var isValidType = function (type) {
    if (!topicTypes[type]) {
      return false;
    } else {
      return true;
    }
  };

  // Validate an options config and return config when valid
  // otherwise return null
  //options:
  // dataType: set or string
  // name: required
  // description: optional
  var validateOptions = function validateOptions(options) {
    console.log(options);
    var defaultOptions = {
      description: ''
    };
    // Apply defaults
    _.defaults(options, defaultOptions);
    // Must contain name and dataType
    if (!options[validOptions.name] || !options[validOptions.datatype]) {
      return null;
    }
    if (!isValidType(options.datatype)) {
      return null;
    }
    // Replace spaces in name with underscores since it will be part of a key.
    // options.name = options.name.replace(/  */g, '_');
    // console.log(options.name);
    return {
      name: options.name,
      datatype: options.datatype,
      description: options.description
    };
  };

  // Coerce types returned from store
  // Param: metadata - metadata JSON object
  var castMetadata = function castMetadata(metadata) {
    metadata.createdTime = _.parseInt(metadata.createdTime);
    metadata.modifiedTime = _.parseInt(metadata.modifiedTime);
    metadata.num = _.parseInt(metadata.num);
    return metadata;
  };

  // TODO - no longer can get key simply from metadata
  // since we're not storing the parent info in the metadata
  // need to derive key from topic key
  // Save topic metadata
  // Param: metadata - metadata to save
  var saveMetadata = function saveMetadata(metadata) {
    console.log('saveMetadata metadata', metadata);
    var parent = _.create({}, metadata.parent);
    var hash = _.create({}, metadata);
    // stringify this since it is nested json
    hash.parent = JSON.stringify(parent);
    console.log('saveMetadata hash ', hash);
    console.log('saveMetadata metadata is now', metadata);
    return store.setMetadata(keyGen.topicMetaKey(metadata), hash);
  };

  // Retrieve metadata from store
  // Param: metadata key
  var getMetadata = function getMetadata(key) {
    return store.getMetadata(key)
    .then(function (reply) {
      // console.log(reply);
      if (reply !== null) {
        // reply = castMetadata(reply);
        // var parent = reply.parent;
        var metadata = castMetadata(reply);
        metadata.parent = JSON.parse(reply.parent);
        return metadata;
      } else {
        return null;
      }
    })
    .catch(function (err) {
      throw err;
    });
  };

  // Add setkey to a set with current time as score
  var saveKey = function addToSet(metadata, setKey) {
    return store.addItem(keyGen.topicKey(metadata), setKey, timestamp());
  };

  // Remove a key from a set
  // Params: metadata - topic metadata for the key
  //         setKey - key to remove
  var removeKey = function removeKey(metadata, setKey) {
    return store.removeItem(keyGen.topicKey(metadata), setKey);
  };

  // Save topic data
  // Params: metadata - metadata describing topic
  //         data - data to be saved
  var saveData = function saveData(metadata, data) {
    console.log('saveData metadata is ', metadata);
    // console.log('saveData data is ', data);
    return store.setData(keyGen.topicKey(metadata), data);
  };

  // Get data (string) from store for a topic
  var getData = function getData(metadata) {
    return store.getData(keyGen.topicKey(metadata));
  };

  // Create topic object and save metadata
  var createTopic = function createTopic(ticket, options) {
    var topic = topicFactory(ticket, options);
    return topic.create();
  };

  // add items to topic data. Stored as sorted set if score included.
  var addItems = function addItems(metadata, items, score) {
    return store.addItem(items, keyGen.topicKey(metadata), score);
  };

  // Get items (set or sorted set) from topic
  var getItems = function getItems(metadata) {
    return store.listItems(keyGen.topicKey(metadata));
  };

  // Remove items from set or sorted set topic data
  var removeItems = function removeItems(metadata, items) {
    return store.removeItem(items, keyGen.topicKey(metadata));
  };

  var updateMetdata = function updateMetadata(config) {
    var result = {};
    if (config.hasOwnProperty(description)) {
      result.description = config.description;
    }
    if (config.hasOwnProperty(name)) {
      result.name = config.name;
    }
    return result;
  };

  // Create a topic object with methods from ticket and options
  var topicFactory = function topicFactory(ticket, options) {
    var metadata = {};
    if (options === null || options === undefined) {
      throw new Error('Failed to provide options to topicFactory');
    } else {
      if (validateOptions(options) !== null) {
        metadata = {
          metadata: validateOptions(options)
        };
        metadata.metadata.parent = {};
        metadata.metadata.parent.num = ticket.metadata.num;
        metadata.metadata.parent.type = ticket.metadata.type;
      } else {
        throw new Error ('Invalid options supplied to topicFactory');
      }

      if (metadata.metadata.parent.type === 'mitigation') {
        // Mitigation use name as keyname
        metadata.metadata.keyname = metadata.metadata.name;
      } else {
        metadata.metadata.keyname = 'topic';
      }
      console.log('topicfactory metadata is ', metadata);
      return (_.extend({}, topicPrototype, metadata));
    }
  };

  var extendFactory = function extendFactory(config) {
    // config = castMetadata(config);
    // console.log('completeTopic config after cast ', config);
    var topicObject = topicFactory(config.metadata.parent, {
      name: config.metadata.name,
      datatype: config.metadata.datatype,
      description: config.metadata.description
    });
    _.extend(topicObject.metadata, config.metadata);
    topicObject.key = config.key;
    return topicObject;
  };

  // Get data and metadata for a topic from a topic key
  // Returns metadata and data - not a complete topic object
  // with functions
  var getTopic = function getTopic(topicKey) {
    var topic = {};
    var metaKey = keyGen.metaKeyFromKey(topicKey);
    // console.log('getTopicMetaKey ', metaKey);
    return getMetadata(metaKey)
    .then(function (reply) {
      // console.log(reply);
      topic.metadata = reply;
      topic.key = topicKey;
      // console.log(topic);
      if (topic.metadata.datatype === 'string') {
        return getData(topic.metadata);
      } else {
        return getItems(topic.metadata);
      }
    })
    .then(function (reply) {
      // console.log(reply);
      topic.data = reply;
      return topic;
    })
    .catch(function (err) {
      throw err;
    });
  };

  // Get array of topics for a ticket - just metadata and data
  // Input is ticket key
  var getTopics = function getTopics(ticketKey) {
    // console.log(key);
    var promises = [];
    // Return promise with array of topic keys
    return store.listItems(keyGen.topicSetKeyFromTicketKey(ticketKey))
    .then(function (reply) {
      // console.log(reply);
      _.forEach(reply, function (value, index) {
        promises.push(getTopic(value));
      });
      // Return array of topics
      return q.all(promises);
    })
    .catch(function (err) {
      throw err;
    });
  };

  var getTopicKeys = function getTopicKeys(ticketKey) {
    var promises = [];
    // Return promise with array of topic keys
    return store.listItems(keyGen.topicSetKeyFromTicketKey(ticketKey));
  };

  var getTopicsMetadata = function getTopicsMetadata(key) {
    var promises = [];
    return store.listItems(keyGen.topicSetKeyFromTicketKey(key))
    .then(function (reply) {
      // console.log(reply);
      _.forEach(reply, function (value, index) {
        promises.push(getTopicMetadata(value));
      });
      return q.all(promises);
    })
    .catch(function (err) {
      throw err;
    });
  };

  // Get metadata for a topic from a topic key
  var getTopicMetadata = function getTopicMetdata(key) {
    // console.log('getTopic key', key);
    var topic = {};
    var metaKey = keyGen.metaKeyFromKey(key);
    // console.log('getTopicMetaKey ', metaKey);
    return getMetadata(metaKey)
    .then(function (reply) {
      // console.log(reply);
      topic.metadata = reply;
      topic.key = key;
      return topic;
    })
    .catch(function (err) {
      throw err;
    });
  };

  // Given a topic key, delete the topic from the store
  var deleteTopic = function deleteTopic(key) {
    // Get metadata from topic key so we can get all keys needed
    logger.debug('in deleteTopic key is ', key);
    return getTopicMetadata(key)
    .then (function (reply) {
      console.log('reply from getTopicMetadata', reply.metadata);
      var promises = [];
      promises.push(store.deleteKey(keyGen.topicMetaKey(reply.metadata)));
      promises.push(store.deleteKey(keyGen.topicKey(reply.metadata)));
      promises.push(removeKey(reply.metadata, keyGen.topicSetKey(reply.metadata)));
      return q.all(promises);
    })
    .catch(function (err) {
      logger.error('Error in deleteTopic', err);
      throw err;
    });
  };


  var topicPrototype = {
    // score is optional
    create: function (data, score) {
      var self = this;
      var promises = [];
      self.metadata.createdTime = timestamp();
      self.metadata.modifiedTime = self.metadata.createdTime;
      // increment counter
      return store.incrCounter(keyGen.topicCounterKey())
      .then(function (reply) {
        // Save counter value
        self.metadata.num = reply;
        console.log('topic create metadata is ', self.metadata);
        // Save metadats
        promises.push(saveMetadata(self.metadata));
        // Save topic key in set of topic keys
        promises.push(saveKey(self.metadata, keyGen.topicSetKey(self.metadata)));
        // Save data
        if (self.metadata.datatype === 'string') {
          promises.push(saveData(self.metadata, data));
        } else {
          promises.push(addItems(self.metadata, data, score));
        }
        return q.all(promises);
      })
      .catch(function (err) {
        logger.error('create error: ', err.toString());
        return new Error(err.toString());
      });
    },
    exists: function exists() {
      var self = this;
      return store.existsInSet(keyGen.topicKey(self.metadata), keyGen.topicSetKey(self.metadata));
    }
  };

  var topic = {
    topicFactory: topicFactory,
    getTopic: getTopic,
    getTopics: getTopics,
    getTopicKeys: getTopicKeys,
    getTopicMetadata: getTopicMetadata,
    getTopicsMetadata: getTopicsMetadata,
    extendFactory: extendFactory,
    deleteTopic: deleteTopic
  };

  // if (config.env === 'test') {
  //   topic._private = {
  //     getTopicObject: getTopicObject
  //   };
  // }

  return topic;

};
