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

// Topic portion of key only
var topicData = function topicData(topicKey) {
  // Removes the parent key portion of the topic key and returns topic portion
  return topicKey.substring((ticketKey(topicKey).length + 1), topicKey.length);
};

var topicName = function topicName(topicKey) {
  // Split the topic portion of key into type and name and return name
  return (topicData(topicKey).split(c.config.delimiter))[1];
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
  filePath: filePath,
  fileSubPath: fileSubPath,
  fileName: fileName,
  isFileGlobal: isFileGlobal,
  fileUser: fileUser
};
