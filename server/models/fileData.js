'use strict';

/**
  * file: models/fileData.js
  */

var _ = require('lodash-compat'),
    stream = require('stream'),
    util = require('util'),
    q = require('q'),

    config = require('../config/config'),
    c = require('../config/redisScheme'),
    keyGen = require('./keyGen'),
    extract = require('./keyExtract'),
    logger = require('../utils/logger'),
    dimsUtils = require('../utils/util');

// module.exports = function FileData(serviceLocator) {
module.exports = function FileData(db) {
  // var db = serviceLocator.get('db');

  // Prototype for each fileData object
  var filePrototype = {

    save: function save(content) {
      var self = this;
      self.createdTime = dimsUtils.createTimestamp();
      self.modifiedTime = self.createdTime;
      // scrub the path a bit
      self.path = scrubPath(self.path);
      // Save the contents
      return db.set(keyGen.fileKey(self), content)
      .then(function (reply) {
        // Save metadata
        return db.hmset(keyGen.fileMetaKey(self), self.getConfig());
      })
      .then(function (reply) {
        // Successfully saved the file and metadata. Now add key to set of keys
        return db.zadd(keyGen.fileSetKey(self), self.createdTime, keyGen.fileKey(self));
      })
      .then(function (reply) {
        // Return the file object
        return self;
      })
      .catch(function (err) {
        logger.error('models/fileData.js: create had an err returned from redis', err);
        return new Error(err.toString());
      });
    },

    // Retrieves the file content as a string from the database
    getContent: function getContent() {
      var self = this;
      return db.get(keyGen.fileKey(self))
      .then(function (reply) {
        return q(reply);
      })
      .catch(function (err) {
        logger.error('models/fileData.js: getContent had an err returned from redis', err);
        return new Error(err.toString());
      });
    },

    // Returns true if the file has been saved in the database
    exists: function exists() {
      var self = this;
      return db.zrank(keyGen.fileSetKey(self), keyGen.fileKey(self))
      .then(function (reply) {
        if (reply >= 0 && reply !== undefined && reply !== null) {
          return true;
        } else {
          return false;
        }
      })
      .catch(function (err) {
        logger.error('models/fileData.js: exists had an err returned from redis', err);
        return new Error(err.toString());
      });

    },

    // Retrieves the file metadata from database and returns it
    getMetadata: function getMetadata() {
      var self = this;
      return db.hgetall(keyGen.fileMetaKey(self))
      .then (function (reply) {
        // Convert to integer, boolean since client returns all as string
        reply.createdTime = _.parseInt(reply.createdTime);
        reply.modifiedTime = _.parseInt(reply.modifiedTime);
        if (reply.global === 'true') {
          reply.global = true;
        } else {
          reply.global = false;
        }
        return reply;
      })
      .catch(function (err) {
        logger.error('models/fileData.js: getMetadata had an err returned from redis', err);
        return new Error(err.toString());
      });
    },

    // Returns a config object from properties of the file object
    getConfig: function getConfig() {
      var self = this,
      config = {
        creator: self.creator,
        description: self.description,
        global: self.global,
        path: self.path,
        name: self.name
      };
      if (self.createdTime !== undefined) {
        config.createdTime = self.createdTime;
      }
      if (self.modifiedTime !== undefined) {
        config.modifiedTime = self.modifiedTime;
      }
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
    // scrub the path
    config.path = scrubPath(config.path);
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

  var scrubPath = function scrubPath(path) {
    // Strip trailing and initial, replace spaces with underscores
    return _.trim(path, ' /').replace(' ', '_');
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
