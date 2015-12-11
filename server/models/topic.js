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

  var isValidType = function (type) {
    if (!topicTypes[type]) {
      return false;
    } else {
      return true;
    }
  };

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

  // Coerce types returned from redis
  var castMetadata = function castMetadata(metadata) {
    metadata.createdTime = _.parseInt(metadata.createdTime);
    metadata.modifiedTime = _.parseInt(metadata.modifiedTime);
    metadata.num = _.parseInt(metadata.num);
    return metadata;
  };

  var topicFactory = function topicFactory(ticket, options) {
    var metadata = {};
    if (options === null || options === undefined) {
      return new Error('Failed to provide options to topicFactory');
    } else {
      if (validateOptions(options) !== null) {
        metadata = {
          metadata: validateOptions(options)
        };
        metadata.metadata.parent = ticket.metadata;
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

  // Add key to a set with current time as score
  var saveKey = function addToSet(metadata, setKey) {
    return store.addItem(keyGen.topicKey(metadata), setKey, timestamp());
  };

  var saveMetadata = function saveMetadata(metadata) {
    // console.log('saveMetadata metadata', metadata);
    var parent = _.create({}, metadata.parent);
    // stringify this since it is nested json
    // console.log('saveMetadata parent', parent);
    var hash = _.create({}, metadata);
    hash.parent = JSON.stringify(parent);
    // console.log('saveMetadata hash ', hash);
    // console.log('saveMetadata metadata is now', metadata);
    return store.setMetadata(keyGen.topicMetaKey(metadata), hash);
  };

  var removeKey = function removeKey(metadata, setKey) {
    return store.removeItem(keyGen.topicKey(metadata), setKey);
  };

  var getMetadata = function getMetadata(key) {
    return store.getMetadata(key)
    .then(function (reply) {
      // console.log(reply);
      if (reply !== null) {
        reply = castMetadata(reply);
        var parent = reply.parent;
        var metadata = reply;
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

  // Data should be JSON?
  var saveData = function saveData(metadata, data) {
    console.log('saveData metadata is ', metadata);
    // console.log('saveData data is ', data);
    return store.setData(keyGen.topicKey(metadata), data);
  };

  var getData = function getData(metadata) {
    return store.getData(keyGen.topicKey(metadata));
  };

  var createTopic = function createTopic(ticket, options) {
    var topic = topicFactory(ticket, options);
    return topic.create();
  };

  var addItems = function addItems(metadata, items, score) {
    return store.addItem(items, keyGen.topicKey(metadata), score);
  };

  var getItems = function getItems(metadata) {
    return store.listItems(keyGen.topicKey(metadata));
  };

  var removeItems = function removeItems(metadata, items) {
    return store.removeItem(items, keyGen.topicKey(metadata));
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

  // var getTopicObject = function getTopicObject(metaKey) {
  //   return getMetadata(metaKey)
  //   .then(function (reply) {
  //     if (reply !== null) {
  //       // console.log('getTopicObject reply', reply);
  //       return completeTopic(reply);
  //     } else {
  //       return null;
  //     }
  //   })
  //   .catch(function (err) {
  //     throw err;
  //   });
  // };

  // Get data and metadata for a topic from a topic key
  var getTopic = function getTopic(key) {
    // console.log('getTopic key', key);
    var topic = {};
    var metaKey = keyGen.metaKeyFromKey(key);
    // console.log('getTopicMetaKey ', metaKey);
    return getMetadata(metaKey)
    .then(function (reply) {
      // console.log(reply);
      topic.metadata = reply;
      topic.key = key;
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

  // Get array of topics - just metadata and data
  // Input is ticket key
  var getTopics = function getTopics(key) {
    // console.log(key);
    var promises = [];
    return store.listItems(keyGen.topicSetKeyFromTicketKey(key))
    .then(function (reply) {
      // console.log(reply);
      _.forEach(reply, function (value, index) {
        promises.push(getTopic(value));
      });
      return q.all(promises);
    })
    .catch(function (err) {
      throw err;
    });
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
    .then(function (reply) {
      // console.log(reply);
      topic.data = reply;
      return topic;
    })
    .catch(function (err) {
      throw err;
    });
  };

  // score is optional
  var topicPrototype = {
    create: function (data, score) {
      var self = this;
      var promises = [];
      self.metadata.createdTime = timestamp();
      self.metadata.modifiedTime = self.metadata.createdTime;
      return store.incrCounter(keyGen.topicCounterKey())
      .then(function (reply) {
        self.metadata.num = reply;
        promises.push(saveMetadata(self.metadata));
        promises.push(saveKey(self.metadata, keyGen.topicSetKey(self.metadata)));
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
    delete: function () {
      var self = this;
      var promises = [];
      promises.push(store.deleteKey(keyGen.topicMetaKey(self.metadata)));
      promises.push(store.deleteKey(keyGen.topicKey(self.metadata)));
      promises.push(removeKey(self.metadata, keyGen.topicSetKey(self.metadata)));
      self.metadata = {};
      return q.all(promises);
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
    getTopicMetadata: getTopicMetadata,
    getTopicsMetadata: getTopicsMetadata,
    extendFactory: extendFactory
  };

  // if (process.env.NODE_ENV === 'test') {
  //   topic._private = {
  //     getTopicObject: getTopicObject
  //   };
  // }

  return topic;

};
