'use strict';

var config = require('../config');
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

// May be able to delete this
var parseTopicKey = function parseTopicKey (topicKey) {
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
  ticketNum: ticketNum
};
