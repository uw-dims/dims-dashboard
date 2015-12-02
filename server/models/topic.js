'use strict';


var config = require('../config/config'),
    keyGen = require('./keyGen'),
    keyExtract = require('./keyExtract'),
    logger = require('../utils/logger')(module),
    _ = require('lodash-compat');


module.exports = function Topic(store) {

  var topic = {};

  var initialTopicConfig = {
    parent: null,
    type: null,
    name: null,
    dataType: 'hash'
  };

  var save = function save(key, metaKey, metaData, content) {
    var data = {
      data: content
    };
    return q.all([
      store.setMetaData(metaKey, metaData),
      store.setData(key, data)
    ]);
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
    
  }

  var topicPrototype = {
    create: function (ticket, name, type, content) {

      var self = this;
      var topic = topicFactory({
        parent: ticket,
        type: type,

      })

    }
  };

};
