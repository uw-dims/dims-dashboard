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

/**
  * file: models/fileData.js
  */

var _ = require('lodash-compat'),
    stream = require('stream'),
    util = require('util'),
    q = require('q'),
    keyGen = require('./keyGen'),
    logger = require('../utils/logger')(module),
    dimsUtils = require('../utils/util');

// module.exports = function FileData(serviceLocator) {
module.exports = function FileData(db) {

  // Prototype with functions for a fileData object
  var filePrototype = {

    create: function create(content) {
      var self = this;
      var deferred = q.defer();
      self.createdTime = dimsUtils.createTimestamp();
      self.modifiedTime = self.createdTime;
      // Make sure the file does not already exist
      db.zrankProxy(keyGen.fileSetKey(self), keyGen.fileKey(self))
      .then(function (reply) {
        if (reply !== null) {
          deferred.reject(new Error('Key for file already exists'));
        } else {
          var multi = db.multi();
          multi.set(keyGen.fileKey(self), content);
          multi.hmset(keyGen.fileMetaKey(self), self.getConfig());
          multi.zadd(keyGen.fileSetKey(self), self.createdTime, keyGen.fileKey(self));
          multi.exec(function (err, replies) {
            if (err) {
              deferred.reject(err);
            } else {
              logger.debug('create: replies from multi.exec', replies);
              deferred.resolve(self);
            }
          });
        }
      });
      return deferred.promise;
    },

    save: function save(content) {
      var self = this;
      var deferred = q.defer();
      // Update modified time
      self.modifiedTime = dimsUtils.createTimestamp();
      var multi = db.multi();
      multi.set(keyGen.fileKey(self), content);
      multi.hmset(keyGen.fileMetaKey(self), self.getConfig());
      multi.exec(function (err, replies) {
        if (err) {
          deferred.reject(err);
        } else {
          logger.debug('save: replies from multi.exec', replies);
          deferred.resolve(self);
        }
      });
      return deferred.promise;
    },

    // Retrieves the file content as a string from the database
    getContent: function getContent() {
      var self = this;
      return db.getProxy(keyGen.fileKey(self));
    },

    // Returns true if the file has been saved in the database
    exists: function exists() {
      var self = this;
      return db.zrankProxy(keyGen.fileSetKey(self), keyGen.fileKey(self))
      .then(function (reply) {
        return reply === null ? false : true;
      })
      .catch(function (err) {
        logger.error('exists: Error returned from redis', err);
        return new Error(err.toString());
      });
    },

    // Retrieves the file metadata from database and returns it
    getMetadata: function getMetadata() {
      var self = this;
      return db.hgetallProxy(keyGen.fileMetaKey(self))
      .then(function (reply) {
        // Convert to integer, boolean since client returns all as string
        reply.createdTime = _.parseInt(reply.createdTime);
        reply.modifiedTime = _.parseInt(reply.modifiedTime);
        reply.global = (reply.global === 'true') ? true : false;
        return reply;
      })
      .catch(function (err) {
        logger.error('getMetadata: Error returned from redis', err);
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
        path: self.path
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

  // Return list of keys for a type
  var list = function list(type) {
    return db.zrangeProxy(keyGen.fileSetKey(type), 0, -1);
  };

  // var getMetadata = function getMetadata(key) {
  //   return db.hgetallProxy(keyGen)
  // }

  // Factory function to create an unsaved fileData object
  var fileDataFactory = function fileDataFactory(options) {
    var defaults = {
      global: false,
      description: ''
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

  var scrubMetaData = function scrubMetaData(config) {
    config.createdTime = _.parseInt(config.createdTime);
    config.modifiedTime = _.parseInt(config.modifiedTime);
    config.global = (config.global === 'true') ? true : false;
    return config;
  };

  // Validate a config
  var validateConfig = function validateConfig(config) {
    if (!config.hasOwnProperty('creator')) {
      return new Error('validateConfig: Options must contain creator');
    }
    if (!config.hasOwnProperty('path')) {
      return new Error('validateConfig: Options must contain path');
    }
    if (typeof config.global !== 'boolean') {
      return new Error('validateConfig: global must either be true or false');
    }
    return config;
  };

  var scrubPath = function scrubPath(path) {
    // Strip trailing and initial, replace spaces with underscores
    return _.trim(path, ' :').replace(' ', '_');
  };

  // Stream writer function to receive content if it is a stream
  // Input is reference to a fileData object
  var ContentWriter = function ContentWriter(newFile, fcnName) {
    var self = this;
    self.string = '';
    stream.Writable.call(self);
    // Implement the _write method
    self._write = function (chunk, encoding, callback) {
      // Convert chunks to string
      self.string += chunk.toString();
      callback();
    };
    // On finish event save the data
    self.on('finish', function () {
      if (fcnName === 'create') {
        newFile.create(self.string)
        // fileData.create(self.string)
        .then(function (reply) {
          /* jshint unused: false */
          self.emit('filesave', 'done');
        });
      } else {
        newFile.save(self.string)
        // fileData.create(self.string)
        .then(function (reply) {
          /* jshint unused: false */
          self.emit('filesave', 'done');
        });
      }
    });
  };

  // ContentWriter inherits from stream.Writable
  util.inherits(ContentWriter, stream.Writable);

  // Factory to create a new contentWriter
  // We have to use 'new' here
  var contentWriterFactory = function contentWriterFactory(newFile, fcnName) {
    return new ContentWriter(newFile, fcnName);
  };

  var fileData = {
    fileDataFactory: fileDataFactory,
    writer: contentWriterFactory
  };
  return fileData;
};
