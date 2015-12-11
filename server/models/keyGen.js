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

  ticketKey: function ticketKey(ticketMetadata) {
    // console.log('ticketKey, ticket is ', ticket);
    // console.log('ticketKey: ticket.type', ticketMetadata.type, 'ticket.num', ticketMetadata.num);
    return c.makeBase('ticket', ticketMetadata.type, ticketMetadata.num);
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

  ticketPublicKey: function ticketPublicKey() {
    return c.addSuffix(c.makeRoot('ticket'), 'public');
  },
  ticketPrivateKey: function ticketPrivateKey() {
    return c.addSuffix(c.makeRoot('ticket'), 'private');
  },

  ticketOwnerKey: function ticketOwnerKey(owner) {
    return c.addSuffix(c.makeRoot('ticket'), 'owner', owner);
  },

  ticketSubscriptionsKey: function ticketSubscriptionsKey(user) {
    return c.addSuffix(c.makeRoot('ticket'), 'subscriptions', user);
  },

  ticketSubscribersKey: function ticketSubscribersKey(ticketMetadata) {
    return c.addSuffix(this.ticketKey(ticketMetadata), 'subscribers');
  },

  ticketTypeKey: function ticketTypeKey(type) {
    // if (type !== 'private') {
    return c.addSuffix(c.makeRoot('ticket'), 'type', type);
    // } else {
    //   return c.addSuffix(c.makeRoot('ticket'), 'type', type, owner);
    // }
  },

  // Key to a topic
  // "ticket:num:topicname:topicnum" aka key_of_parentTicket:topicname:topicnum
  // Only includes counter if it exists
  topicKey: function topicKey(topicMeta) {
    // var key = this.ticketKey(topic.parent) + c.delimiter + topic.type + c.delimiter + topic.name;
    // return key;
    // console.log('topicKey topic is ', topic);
    // console.log('topic parent is ', topic.parent);
    // console.log('[+++] topicKey - topicMetata = ', topicMeta);

    return c.addContent(this.ticketKey(topicMeta.parent), topicMeta.keyname, topicMeta.num);
  },

  topicMetaKey: function topicMetaKey(topicMeta) {
    // console.log('[+++] topicMetaKey = ', topicMeta);
    return c.addSuffix(this.topicKey(topicMeta), 'metadata');
  },

  // Counter for topics that need it - to ensure uniqueness
  topicCounterKey: function topicCounterKey() {
    return c.addSuffix(c.makeBase('ticket', 'topic'), 'counter');
  },

  // Key to list or set of topics associated to a ticket
  // "ticket:type:num.__topics"
  topicSetKey: function topicSetKey(topicMeta) {
    // console.log('[+++] topicSetKey topic', topicMeta);
    // return c.namespace + this.ticketKey(ticket) + c.topicSuffix;
    return c.addSuffix(this.ticketKey(topicMeta.parent), 'topics');
  },

  topicSetKeyFromTicketKey: function topicSetKeyFromTicketKey(key) {
    return c.addSuffix(key, 'topics');
  },

  topicKeyFromMetaKey: function topicKeyFromMetaKey(key) {
    var keyArray = key.split(c.config.delimiter);
    var topicKeyArray = _.take(keyArray, 6);
    return topicKeyArray.join(c.config.delimiter);
  },

  metaKeyFromKey: function metaKeyFromKey(key) {
    return c.addSuffix(key, 'metadata');
  },

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
