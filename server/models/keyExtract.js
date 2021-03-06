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

var _ = require('lodash-compat');
var c = require('../config/redisScheme');
var logger = require('../utils/logger')(module);

// Key Parser - Extract data from keys

// Tickets

// Ticket key from topic key
var ticketKey = function ticketKey(topicKey) {
  var root = c.makeBase('ticket').split(c.config.delimiter);
  var keyArray = topicKey.split(c.config.delimiter);
  // keyArray = _.drop(keyArray, root.length);
  // logger.debug('ticketKey keyArray', keyArray);
  // return keyArray.join(c.config.delimiter);
  return (_.slice(keyArray, 0, root.length + 1)).join(c.config.delimiter);
};

var isMitigation = function isMitigation(ticketKey) {
  var keyArray = ticketKey.split(c.config.delimiter);
  return keyArray[2] === 'mitigation';
};

// Topic portion of key only
var topicData = function topicData(topicKey) {
  // Removes the parent key portion of the topic key and returns topic portion
  return topicKey.substring((ticketKey(topicKey).length + 1), topicKey.length);
};

var topicName = function topicName(topicKey) {
  // Split the topic portion of key into type and name and return name
  var topicString = topicData(topicKey);
  var topicArray = topicString.split(c.config.delimiter);
  topicArray = _.slice(topicArray, 1, topicArray.length).join(':');
  return topicArray;
};

var ticketType = function ticketType(topicKey) {
  var root = c.makeBase('ticket').split(c.config.delimiter);
  // Key array
  var keyArray = topicKey.split(c.config.delimiter);
  return (_.slice(keyArray, root.length + 1, root.length + 2)).join();
};

var ticketNum = function ticketNum(ticketKey) {
  // Ticket number (integer) from ticketKey
  // Root array
  // var root = c.makeBase('ticket').split(c.config.delimiter);
  // Key array
  var keyArray = ticketKey.split(c.config.delimiter);
  // return parseInt((_.slice(keyArray, root.length + 1, root.length + 2)).join());
  return _.parseInt(keyArray[keyArray.length - 1]);
};

// Return true if key is global, false if a user key
var isFileGlobal = function isFileGlobal(pathKey) {
  return (pathKey.split(c.config.delimiter)[2] === c.config.file.globalRoot);
};

// Get user from key if it is not global. Return null if it is global.
var fileUser = function fileUser(pathKey) {
  if (!isFileGlobal(pathKey)) {
    return pathKey.split(c.config.delimiter)[2];
  } else {
    return null;
  }
};

// Return file name from a file key
var fileName = function fileName(pathKey) {
  var pathArray = pathKey.split(':');
  return pathArray[pathArray.length - 1];
};

// Return complete path from a file key
// We strip off starting slash
var filePath = function filePath(pathKey) {
  var root = c.makeRoot('file');
  var trimmedPath = _.trimLeft(pathKey.replace(/:/g, '/'), root + '/');
  if (isFileGlobal(pathKey)) {
    return _.trimLeft(_.trimLeft(trimmedPath, c.config.file.globalRoot), '/');
  } else {
    return _.trimLeft(trimmedPath, '/');
  }
};

// Return subpath from a file key. Keep trailing slash
var fileSubPath = function fileSubPath(pathKey) {
  if (isFileGlobal(pathKey)) {
    // Trim file name and return
    return _.trimRight(filePath(pathKey), fileName(pathKey));
  } else {
    // Trim user and file name and return
    return _.trimLeft(_.trimLeft(_.trimRight(filePath(pathKey), fileName(pathKey)), fileUser(pathKey)), '/');
  }
};

var userFromAttribute = function userFromAttribute(key) {
  return key.split(c.config.delimiter)[2];
};

var typeFromAttribute = function typeFromAttribute(key) {
  return key.split(c.config.delimiter)[3];
};

// May be able to delete this
var parseTopicKey = function parseTopicKey(topicKey) {
  var keyArray = topicKey.split(c.config.delimiter);
  var ticketKey = keyArray[0] + c.config.delimiter + keyArray[1];
  var topicSubKey = '';
  for (var i = 2; i < keyArray.length; i++) {
    topicSubKey += keyArray[i];
    if (i === (keyArray.length - 1)) {
      topicSubKey += c.config.delimiter;
    }
  }
  return {
    ticketKey: ticketKey,
    topicSubKey: topicSubKey
  };
};

module.exports = {
  topicData: topicData,
  topicName: topicName,
  ticketType: ticketType,
  ticketNum: ticketNum,
  ticketKey: ticketKey,
  isMitigation: isMitigation,
  filePath: filePath,
  fileSubPath: fileSubPath,
  fileName: fileName,
  isFileGlobal: isFileGlobal,
  fileUser: fileUser,
  userFromAttribute: userFromAttribute,
  typeFromAttribute: typeFromAttribute
};
