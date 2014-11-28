'use strict';

var config = require('../config');
var c = require('../config/redisScheme');
var logger = require('../utils/logger');

// Key Generator for tickets

var KeyGen = {

  // Key to ticket counter
  // "tickets.__counter"
  ticketCounterKey: function() {
    return c.tickets.setName + c.counterSuffix;
  },

  // Key to a ticket - generated from a ticket
  // "ticket:num:username"
  ticketKey: function(ticket) {
    return c.tickets.prefix + c.delimiter + ticket.num + c.delimiter + ticket.name;
  },

  // Key to the set of tickets
  // "tickets"
  ticketSetKey: function() {
    return c.tickets.setName;
  },

  // Key to list of topics associated to a ticket
  // "ticket:num:username.__topics"
  topicListKey: function(ticket) {
    return this.ticketKey(ticket) + c.topicSuffix;
  },

  // Key to a topic counter
  // "ticket:num:username:topicname.__counter"
  topicCounterKey: function(ticket, topicName) {
    return this.ticketKey(ticket) + c.delimiter + topicName + c.counterSuffix 
  },

  // Key to a topic
  // "ticket:num:username:topicname:topicnum" aka key_of_parentTicket:topicname:topicnum
  topicKey: function(topic) {
    return this.ticketKey(topic.parent) + c.delimiter + topic.name + c.delimiter + topic.num;
  },

  // Key to a topic timestamp
  // "ticket:num:username:topicname:topicnum.__timestamp" aka key_of_topic.__timestamp
  topicTimestampKey: function(topic) {
    return this.topicKey(topic) + c.timestampSuffix;
  }

};

var exports = module.exports = KeyGen;
