'use strict';

var _ = require('lodash-compat');
var config = require('../config/config');
var c = require('../config/redisScheme');
var logger = require('../utils/logger');

// Key Parser - Extract data from keys

// Tickets

var topicData = function topicData(topicKey, ticketKey) {
  // Removes the parent key portion of the topic key and returns topic portion
  return topicKey.substring((ticketKey.length + 1), topicKey.length);
};

var topicName = function topicName(topicKey, ticketKey) {
  // Split the topic portion of key into type and name and return name
  return (topicData(topicKey, ticketKey).split(c.delimiter))[1];
};

var ticketType = function ticketType(topicKey, ticketKey) {
  // Split the topic portion of key into type and name and return name
  return (topicData(topicKey, ticketKey).split(c.delimiter))[0];
};

var ticketNum = function ticketNum(ticketKey) {
  // Ticket number (integer) from ticketKey
  return parseInt((ticketKey.split(c.delimiter))[2]);
};

// Return complete path from a file key
// We strip off starting slash
var filePath = function filePath(pathKey) {
  var trimmedPath = _.trimLeft(pathKey.replace(/:/g, '/'), c.files.prefix + '/');
  if (isFileGlobal(pathKey)) {
    return _.trimLeft(_.trimLeft(trimmedPath, 'global'), '/');
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

// Return true if key is global, false if a user key
var isFileGlobal = function isFileGlobal(pathKey) {
  return (pathKey.split(c.delimiter)[1] === c.files.globalRoot);
};

// Get user from key if it is not global. Return null if it is global.
var fileUser = function fileUser(pathKey) {
  if (!isFileGlobal(pathKey)) {
    return pathKey.split(c.delimiter)[1];
  } else {
    return null;
  }
};

// Return file name from a file key
var fileName = function fileName(pathKey) {
  var pathArray = pathKey.split(':');
  return pathArray[pathArray.length - 1];
};

// May be able to delete this
var parseTopicKey = function parseTopicKey(topicKey) {
  logger.debug('KeyGen.parseTopicKey: key is ', topicKey);
  var keyArray = topicKey.split(c.delimiter);
  logger.debug('KenGen.parseTopicKey: keyArray is ', keyArray);
  var ticketKey = keyArray[0] + c.delimiter + keyArray[1];
  var topicSubKey = '';
  for (var i = 2; i < keyArray.length; i++) {
    topicSubKey += keyArray[i];
    if (i = keyArray.length - 1) {
      topicSubKey += c.delimiter;
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
  filePath: filePath,
  fileSubPath: fileSubPath,
  fileName: fileName,
  isFileGlobal: isFileGlobal,
  fileUser: fileUser
};
