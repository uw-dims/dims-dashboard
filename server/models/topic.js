'use strict';


var config = require('../config/config'),
    keyGen = require('./keyGen'),
    keyExtract = require('./keyExtract'),
    logger = require('../utils/logger')(module),
    _ = require('lodash-compat'),
    q = require('q'),
    c = require('../config/redisScheme');


module.exports = function Topic(store) {

  var topic = {};

  var initialTopicConfig = {
    parent: null,
    name: null,
    description: null,
    creator: null,
    dataType: 'string'
  };

  var timestamp = function () {
    var now = new Date().getTime();
    return now;
  };

  var save = function save(key, content, metaKey, metaData) {
    var data = {
      data: content
    };
    if (metaData.dataType === 'string') {
      return q.all([
        store.setMetaData(metaKey, metaData),
        store.setData(key, data)
      ]);
    } else if (metaData.dataType === 'set') {
      return q.all([
        store.setMetaData(metaKey, metaData),
        store.addItem(key, content)
      ]);
    } else {
      throw new Error('Invalid dataType supplied: ' + metaData.dataType);
    }
  };

  // add items to a saved array
  var addItems = function addItems(key, metaKey, metaData, content) {
    return store.addItem(key, content);
  };

  var removeItems = function removeItems(key, content) {
    return store.removeItem(key, content);
  };

  var create = function create(key, metaKey, metaData, content, setKey) {
    return exists(key, setKey)
    .then(function (reply) {
      if (!reply) {
        return save(key, metaKey, metaData, content);
      } else {
        return new Error('Topic already exists');
      }
    })
    .catch(function (err) {
      return new Error(err.toString());
    });
  };

  var getData = function getData(key) {
    return store.getData(key);
  };

  var getMetaData = function getMetaData(key) {
    return store.getMetaData(key);
  };

  var exists = function exists(key, setKey) {
    return store.exists(key, setKey);
  };

  var topicFactory = function topicFactory(options) {
    return (_.extend({}, topicPrototype, options));
  };

  var sanitizeName = function sanitizeName(name) {

  };

  var verifyOptions = function verifyOptions(options) {
    if (!options.hasOwnProperty('dataType')) {
      return false;
    }
    if (!c.isValidTopicDataType(options.dataType)) {
      return false;
    }
    return true;
  };

  var topicPrototype = {
    create: function (ticket, options) {
      options = options || {};
      var self = this;
      var createdTime = timestamp();
      var topic = topicFactory({
        parent: ticket,
        type: ticket.type,
        dataType: options.type,
        name: options.name,
        description: options.description,
        createdTime: createdTime,
        modifiedTime: createdTime
      });
      return store.incrCounter(keyGen.topicCounterKey())
      .then(function (reply) {
        topic.num = reply;
        var topicKey = keyGen.topicKey(topic);
      })
      .catch(function (err) {
        logger.error('create error: ', err.toString());
        return new Error(err.toString());
      });

    }
  };

};
