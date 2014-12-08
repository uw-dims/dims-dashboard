'use strict';

var config = require('../config');
var c = require('../config/redisScheme');
var logger = require('../utils/logger');

// Key Generator for tickets
// Keys are derived from ticket and topic objects

var KeyGen = {

  // Key to ticket counter
  // "tickets.__counter"
  ticketCounterKey: function() {
    return c.tickets.counter;
  },

  // Key to a ticket - generated from a ticket
  // "ticket:num" (removed username)
  ticketKey: function(ticket) {
    //return c.tickets.prefix + c.delimiter + ticket.num + c.delimiter + ticket.name;
    return c.tickets.prefix + c.delimiter + ticket.num;

  },

  // Key to the set of tickets
  // "ticket.__tickets"
  ticketSetKey: function() {
    return c.tickets.setName;
  },

  // Key to list or set of topics associated to a ticket
  // "ticket:num.__topics"
  topicListKey: function(ticket) {
    return this.ticketKey(ticket) + c.topicSuffix;
  },

  // Key to a topic counter
  // "ticket:num:topicname.__counter"
  topicCounterKey: function(ticket, topicName) {
    return this.ticketKey(ticket) + c.delimiter + topicName + c.counterSuffix 
  },

  // Key to a topic
  // "ticket:num:topicname:topicnum" aka key_of_parentTicket:topicname:topicnum
  // Only includes counter if it exists
  topicKey: function(topic) {
    var key = this.ticketKey(topic.parent) + c.delimiter + topic.type + c.delimiter + topic.name;
    if (topic.num) {
      key = key  + c.delimiter + topic.num;
    }
    return key;
  },

  // Key to a topic timestamp
  // "ticket:num:username:topicname:topicnum.__timestamp" aka key_of_topic.__timestamp
  topicTimestampKey: function(topic) {
    return this.topicKey(topic) + c.timestampSuffix;
  },

  topicTypeKey: function(topic) {
    return this.topicKey(topic) + c.typeSuffix;
  }

};

var exports = module.exports = KeyGen;
