'use strict';

var config = require('../config');
var c = require('../config/redisScheme');
var logger = require('../utils/logger');

// Key Generator
// Keys are generated from objects

var keyGen = {

  // Key to ticket counter
  // "tickets.__counter"
  ticketCounterKey: function () {
    return c.tickets.counter;
  },

  // Key to a ticket - generated from a ticket
  // "ticket:num" (removed username)
  ticketKey: function (ticket) {
    //return c.tickets.prefix + c.delimiter + ticket.num + c.delimiter + ticket.name;
    return c.tickets.prefix + c.delimiter + ticket.num;
  },

  // Key to the set of tickets
  // "ticket.__tickets"
  ticketSetKey: function () {
    return c.tickets.setName;
  },

  // Key to list or set of topics associated to a ticket
  // "ticket:num.__topics"
  topicListKey: function (ticket) {
    return this.ticketKey(ticket) + c.topicSuffix;
  },

  // Key to a topic counter
  // "ticket:num:topicname.__counter"
  // NOT CURRENTLY IN USE
  topicCounterKey: function (ticket, topicName) {
    return this.ticketKey(ticket) + c.delimiter + topicName + c.counterSuffix;
  },

  // Key to a topic
  // "ticket:num:topicname:topicnum" aka key_of_parentTicket:topicname:topicnum
  // Only includes counter if it exists
  topicKey: function (topic) {
    var key = this.ticketKey(topic.parent) + c.delimiter + topic.type + c.delimiter + topic.name;
    if (topic.num) {
      key = key  + c.delimiter + topic.num;
    }
    return key;
  },

  // Key to a topic timestamp
  // "ticket:num:username:topicname:topicnum.__timestamp" aka key_of_topic.__timestamp
  topicTimestampKey: function (topic) {
    return this.topicKey(topic) + c.timestampSuffix;
  },

  // Key to a file - generated from a file object
  fileKey: function (file) {
    //return c.tickets.prefix + c.delimiter + ticket.num + c.delimiter + ticket.name;
    // return c.tickets.prefix + c.delimiter + ticket.num;
    return c.files.prefix + c.delimiter + file.scope + c.delimiter + file.path + c.delimiter + file.name;
  },

  fileMetaKey: function (file) {
    return this.fileKey(file) + c.files.metaSuffix;
  },

  // Key to the set of file keys
  fileSetKey: function () {
    return c.files.setName;
  },

  // Key to userSettings for a user
  userSettingsKey: function (userSettings) {
    return c.userSettings.prefix + c.delimiter + userSettings.user;
  },
  userSettingsSetKey: function () {
    return c.userSettings.setName;
  }

};

module.exports = keyGen;
