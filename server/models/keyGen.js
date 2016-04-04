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

  ticketTgKey: function ticketTgKey(tg) {
    return c.addSuffix(c.makeRoot('ticket'), 'tg', tg);
  },

  ticketSubscriptionsKey: function ticketSubscriptionsKey(user) {
    return c.addSuffix(c.makeRoot('ticket'), 'subscriptions', user);
  },

  ticketSubscribersKey: function ticketSubscribersKey(ticketMetadata) {
    return c.addSuffix(this.ticketKey(ticketMetadata), 'subscribers');
  },

  ticketTypeKey: function ticketTypeKey(type) {
    return c.addSuffix(c.makeRoot('ticket'), 'type', type);
  },

  // Key to a topic
  topicKey: function topicKey(topicMeta) {
    return c.addContent(this.ticketKey(topicMeta.parent), topicMeta.keyname, topicMeta.num);
  },

  topicMetaKey: function topicMetaKey(topicMeta) {
    return c.addSuffix(this.topicKey(topicMeta), 'metadata');
  },

  // Counter for topics that need it - to ensure uniqueness
  topicCounterKey: function topicCounterKey() {
    return c.addSuffix(c.makeBase('ticket', 'topic'), 'counter');
  },

  // Key to list or set of topics associated to a ticket
  // "ticket:type:num.__topics"
  topicSetKey: function topicSetKey(topicMeta) {
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

  // TODO: Use to save site settings (not user)
  siteSettingsKey: function() {
    return c.makeBase('sitesettings');
  },

  sitSettingsSetKey: function() {
    return c.addSuffix(c.makeRoot('sitesettings'), 'all');
  },

  // Keys to attributes
  attributeKey: function (user, type) {
    return c.makeBase('attribute', user, type);
  },
  attributeSetKey: function () {
    return c.addSuffix(c.makeRoot('attribute'), 'all');
  },

  // Keys to social auth accounts
  // Key to lookup username for service (type) and id
  accountIdKey: function (id, type) {
    return c.makeBase('authaccount', type, id);
  },
  // Key to lookup a social account for a service (type) and username (user)
  accountUserKey: function (user, type) {
    return c.makeBase('authaccount', type, user);
  },
  // Set key to retrieve all social accounts for a user
  accountUserSetKey: function (user) {
    return c.addSuffix(c.makeBase('authaccount', user), 'all');
  }
};

module.exports = keyGen;
