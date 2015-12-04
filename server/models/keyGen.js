'use strict';

var _ = require('lodash-compat');
var c = require('../config/redisScheme');

var scrubPath = function scrubPath(path) {
  // Converts path to format used to create key
  // var newPath = path.replace('/', c.config.delimiter);
  // logger.debug('models/keyGen scrubPath: path is ', newPath);
  // Strip trailing and initial, replace spaces with underscores
  return _.trim(path, ' :').replace(' ', '_');
};

// Key Generator
// Keys are generated from objects and/or params
var keyGen = {

  ticketCounterKey: function ticketCounterKey() {
    return c.addSuffix(c.makeRoot('ticket'), 'counter');
  },

  ticketKey: function ticketKey(ticket) {
    return c.makeBase('ticket', ticket.type, ticket.num);
  },

  ticketSetKey: function ticketSetKey() {
    return c.addSuffix(c.makeRoot('ticket'), 'all');
  },

  ticketOpenKey: function ticketOpenKey() {
    return c.addSuffix(c.makeRoot('ticket'), 'open');
  },

  ticketClosedKey: function ticketClosedKey() {
    return c.addSuffix(c.makeRoot('ticket'), 'closed');
  },

  ticketOwnerKey: function ticketOwnerKey(param) {
    if (typeof param === 'string') {
      return c.addSuffix(c.makeRoot('ticket'), 'owner', param);
    }
    return c.addSuffix(c.makeRoot('ticket'), 'owner', param.creator);
  },

  ticketSubscriptionsKey: function ticketSubscriptionsKey(user) {
    return c.addSuffix(c.makeRoot('ticket'), 'subscriptions', user);
  },

  ticketSubscribersKey: function ticketSubscribersKey(ticket) {
    return c.addSuffix(this.ticketKey(ticket), 'subscribers');
  },

  ticketTypeKey: function ticketTypeKey(param) {
    if (typeof param === 'string') {
      return c.addSuffix(c.makeRoot('ticket'), 'type', param);
    }
    return c.addSuffix(c.makeRoot('ticket'), 'type', param.type);
  },

  // Key to a topic
  // "ticket:num:topicname:topicnum" aka key_of_parentTicket:topicname:topicnum
  // Only includes counter if it exists
  topicKey: function topicKey(topic) {
    // var key = this.ticketKey(topic.parent) + c.delimiter + topic.type + c.delimiter + topic.name;
    // return key;
    return c.addContent(this.ticketKey(topic.parent), topic.name, topic.num);
  },

  // Counter for topics that need it - to ensure uniqueness
  topicCounterKey: function topicCounterKey() {
    return c.addSuffix(c.makeBase('ticket', 'topic'), 'counter');
  },

  // Key to list or set of topics associated to a ticket
  // "ticket:type:num.__topics"
  topicSetKey: function topicSetKey(ticket) {
    // return c.namespace + this.ticketKey(ticket) + c.topicSuffix;
    return c.addSuffix(this.ticketKey(ticket), 'topics');
  },

  // Not sure if this is needed since timestamp is score in set of topics
  // Key to a topic timestamp
  // key_of_topic.__timestamp
  // topicTimestampKey: function (topic) {
  //   return this.topicKey(topic) + c.timestampSuffix;
  // },

  // Key to a file - generated from a file object
  fileKey: function (fileData) {
    var scope = (fileData.global) ? c.config.file.globalRoot : fileData.creator;
    return c.makeBase('file', scope, scrubPath(fileData.path), fileData.name);
  },
  // Key to the metadata for a file
  fileMetaKey: function (file) {
    return c.addSuffix(this.fileKey(file), 'metadata');
  },
  // Key to the set of file keys for the scope of a file or a user
  fileSetKey: function (param) {
    var scope;
    if (typeof param !== 'string') {
      scope = (param.global) ? c.config.file.globalRoot : param.creator;
    } else {
      scope = param;
    }
    return c.addSuffix(c.makeBase('file', scope), 'all');
  },

  // Key to userSettings for a user. Param can be userSettings object or user string
  userSettingsKey: function (param) {
    var user = typeof param !== 'string' ? param.user : param;
    return c.makeBase('userSetting', user);
  },
  userSettingsSetKey: function () {
    return c.addSuffix(c.makeRoot('userSetting'), 'all');
  },

  // Keys to attributes
  attributeKey: function (user, type) {
    return c.makeBase('attribute', user, type);
  },
  attributeSetKey: function () {
    return c.addSuffix(c.makeRoot('attribute'), 'all');
  }
};

module.exports = keyGen;
