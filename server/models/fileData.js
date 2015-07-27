'use strict';

/**
  * file: models/fileData.js
  */

var _ = require('lodash'),
    stream = require('stream'),
    util = require('util'),

    config = require('../config'),
    c = require('../config/redisScheme'),
    keyGen = require('./keyGen'),
    extract = require('./keyExtract'),
    logger = require('../utils/logger'),
    dimsUtils = require('../utils/util');

// module.exports = function FileData(serviceLocator) {
module.exports = function FileData(db) {

  logger.debug('Got to start of FileData');
  // var db = serviceLocator.get('db');

  // Prototype for each fileData object
  var filePrototype = {

    save: function save(content) {
      var self = this;
      self.createdTime = dimsUtils.createTimestamp();
      self.modifiedTime = self.createdTime;
      // Convert slashes in path to delimiter (:) for key
      self.path = pathToKey(self.path);

      // Save the contents
      return db.set(keyGen.fileKey(self), content)
      .then(function (reply) {
        // Save metadata
        return db.hmset(keyGen.fileMetaKey(self), self.getFileMetadata());
      })
      .then(function (reply) {
        // Successfully saved the file and metadata. Now add key to set of keys
        return db.zadd(keyGen.fileSetKey(), self.createdTime, keyGen.fileKey(self));
      })
      .then(function (reply) {
        // Return the file object
        return self;
      })
      .catch(function (err) {
        logger.error('models/File.create had an err returned from redis', err, reply);
        return new Error(err.toString());
      });
    },

    exists: function exits() {
      var self = this;
      return db.zrank(keyGen.fileSetKey(), keyGen.fileKey(self))
      .then(function (reply) {
        if (reply >= 0) {
          return true;
        } else {
          return false;
        }
      });

    },

    getFileMetadata: function getFileMetadata() {
      var self = this,
      config = {
        creator: self.creator,
        createdTime: self.createdTime,
        modifiedTime: self.modifiedTime,
        description: self.description,
        global: self.global,
        path: self.path
      };
      return config;
    }
  };

  // Factory function to create an unsaved fileData object
  var fileDataFactory = function fileDataFactory(options) {
    var defaults = {
      global: false,
      path: ''
    };
    // Apply the options to defaults
    var config = _.extend({}, defaults, options);
    // Validate the resulting config
    if (validateConfig(config) instanceof Error) {
      return validateConfig(config);
    }
    return _.create(filePrototype, config);
  };

  // Validate a config
  var validateConfig = function validateConfig(config) {
    if (!config.hasOwnProperty('creator') || !config.hasOwnProperty('description') || !config.hasOwnProperty('name')) {
      return new Error('Options must include name, description, creator');
    }
    if (typeof config.global !== 'boolean') {
      return new Error('global must either be true or false');
    }
    return config;
  };

  var pathToKey = function pathToKey(path) {
    return path.replace('/', c.delimiter);
  };

  // Stream writer function to receive content if it is a stream
  // Input is reference to a fileData object
  var ContentWriter = function ContentWriter(fileData) {
    var self = this;
    self.string = "";
    stream.Writable.call(self);
    // Implement the _write method
    self._write = function (chunk, encoding, callback) {
      // Convert chunks to string
      self.string += chunk.toString();
      callback();
    };
    // On finish event save the data
    self.on('finish', function () {
      fileData.save(self.string)
      .then(function (reply) {
        self.emit('filesave', 'done');
      });
    });
  };

  // ContentWriter inherits from stream.Writable
  util.inherits(ContentWriter, stream.Writable);

  // Factory to create a new contentWriter
  // We have to use 'new' here
  var contentWriterFactory = function contentWriterFactory(newFile) {
    return new ContentWriter(newFile);
  };

  var fileData = {
    fileDataFactory: fileDataFactory,
    writer: contentWriterFactory
  };

  return fileData;

};
