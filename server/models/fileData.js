'use strict';

/**
  * file: models/fileData.js
  */

var q = require('q'),
    _ = require('lodash'),
    stream = require('stream'),
    util = require('util'),

    config = require('../config'),
    c = require('../config/redisScheme'),
    KeyGen = require('./keyGen'),
    logger = require('../utils/logger'),
    dimsUtils = require('../utils/util');

// TODO: Maybe we can have this and Ticket extend
// from one module to make it more DRY...
module.exports = function FileData(db) {

  var makePath = function makePath(path) {
    return path.replace('/', c.delimiter);
  };

  // Factory function to create an unsaved fileData object
  var fileFactory = function fileFactory(options) {
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
    // Create new object from prototype
    var instance = Object.create(filePrototype);
    return (_.extend(Object.create(filePrototype), config));
  };

  // Validate a config
  var validateConfig = function validateConfig(config) {
    if (!config.hasOwnProperty('creator') || !config.hasOwnProperty('description')) {
      return new Error('You must supply a creator and description to fileFactory');
    }
    if (typeof config.global !== 'boolean') {
      return new Error('global must either be true or false');
    }
    return config;
  };

  // Stream writer function to receive content if it is a stream
  // Input is reference to a fileData object
  var ContentWriter = function ContentWriter(fileData) {
    var self = this;
    logger.debug('models/fileData.contentStreamWriter self: ', self);
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
      logger.debug('final string is ', self.string);
      fileData.save(self.string)
      .then(function (reply) {
        logger.debug('filesave reply is ', reply);
      })
    });
  };

  util.inherits(ContentWriter, stream.Writable);

  // Factory to create a new contentWriter
  // We have to use 'new' here
  var contentWriterFactory = function contentWriterFactory(newFile) {
    return new ContentWriter(newFile);
  };

  // Prototype for each fileData object
  var filePrototype = {

    save: function save(content) {
      var self = this;
      logger.debug('models/fileData.save Content: ', content);
      self.createdTime = dimsUtils.createTimestamp();
      self.modifiedTime = self.createdTime;
      // Convert slashes in path to delimiter (:)
      self.path = makePath(self.path);

      // Save the contents
      return db.set(KeyGen.fileKey(self), content)
      .then(function (reply) {
        // Save metadata
        return db.hmset(KeyGen.fileMetaKey(self), self.getFileMetadata());
      })
      .then(function (reply) {
        // Successfully saved the file and metadata. Now add key to set of keys
        return db.zadd(KeyGen.fileSetKey(), self.createdTime, KeyGen.fileKey(self));
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

  return {
    fileFactory: fileFactory,
    writer: contentWriterFactory
  };

};
