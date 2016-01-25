'use strict';

var _ = require('lodash-compat');

// module.exports = function redisScheme() {

/**
  * ticketSuffix
  * Suffixes are defined for various sets and lists of ticket keys
  * Key Types are as follows:
  * counter - key to counter incremented each time a ticket is created
  * metadata - key to metadata for a particular ticket
  * all - key to sorted set of all ticket keys
  * allOpen - key to sorted set of all open ticket keys
  * allClosed - key to sorted set of all closed ticket keys
  * topics - key to sorted set of all topic keys associated with a particular ticket
  * type - key to sorted set of all ticket keys of a particular type (mitigation, analysis)
  * createdByUser - key to sorted set of all ticket keys created by a particular user
  * subbedByUser - key to sorted set of all ticket keys subscribed to by a particular user
  */
var makeSuffix = function (suffixType, param) {
  var suffix = {
    'counter': function () {
      return '.__counter';
    },
    'metadata': function () {
      return '.__meta';
    },
    'all': function () {
      return '.__keys';
    },
    'open': function () {
      return '.__open';
    },
    'closed': function () {
      return '.__closed';
    },
    'private': function () {
      return '.__private';
    },
    'public': function () {
      return '.__public';
    },
    'topics': function () {
      return '.__topics';
    },
    'type': function (param) {
      if (param === undefined || param === null) {
        throw new Error('Ticket type was not defined for: ', suffixType);
      }
      return '.__type.__' + param;
    },
    'owner': function (param) {
      if (param === undefined || param === null) {
        throw new Error('User was not defined for: ', suffixType);
      }
      return '.__owner.__' + param;
    },
    'tg': function (param) {
      if (param === undefined || param === null) {
        throw new Error('Tg was not defined for: ', suffixType);
      }
      return '.__tg.__' + param;
    },
    'subscriptions': function (param) {
      if (param === undefined || param === null) {
        throw new Error('User was not defined for: ', suffixType);
      }
      return '.__subscriptions.__' + param;
    },
    'subscribers': function () {
      return '.__subscribers';
    }
  };
  if (typeof suffix[suffixType] !== 'function') {
    throw new Error('Invalid suffix type was supplied: ' + suffixType);
  }
  return suffix[suffixType](param);
};

// Add a suffix to a key
var addSuffix = function (key, suffixType, param) {
  return key + makeSuffix(suffixType, param);
};

var getDelimiter = function () {
  return config.delimiter;
};

var makeRoot = function makeRoot(type) {
  // logger.debug('makeRoot type is ', type);
  var base  = {
    'ticket': function () {
      return config.namespace + getDelimiter() + config.ticket.prefix;
    },
    'file': function () {
      return config.namespace + getDelimiter() + config.file.prefix;
    },
    'userSetting': function () {
      return config.namespace + getDelimiter() + config.userSetting.prefix;
    },
    'attribute': function () {
      return config.namespace + getDelimiter() + config.attribute.prefix;
    },
    'authaccount': function () {
      return config.namespace + getDelimiter() + config.authaccount.prefix;
    },
    'notification': function () {
      return config.namespace + getDelimiter() + config.notification.prefix;
    },
    'data': function () {
      return config.namespace + getDelimiter() + config.data.prefix;
    },
    'query': function () {
      return config.namespace + getDelimiter() + config.query.prefix;
    }
  };
  if (typeof base[type] !== 'function') {
    throw new Error('Invalid type was supplied: ' + type);
  }
  // logger.debug(base[type]());
  return base[type]();
};

// options = type plus variable number of content items
var makeBase = function (options) {
  /* jshint unused: false */
  // logger.debug('base options are ', options);
  // Get an array of args
  var args = [].slice.call(arguments, 0);
  // logger.debug('args are', args);
  var key = makeRoot(args[0]);
  // logger.debug('key is ', key);
  args.shift();
  // logger.debug('args are now', args);
  args.forEach(function (item) {
    // logger.debug('item is ', item);
    key = key + getDelimiter() + item;
  });
  return key;
};

// Add content to a base key - useful when constructing keys from other keys
// Options are key, plus a variable number of content items
var addContent = function (options) {
  /* jshint unused: false */
  var args = [].slice.call(arguments, 0);
  var key = args[0];
  args.shift();
  args.forEach(function (item) {
    key = key + getDelimiter() + item;
  });
  return key;
};

// topicTypes is deprecated

var config =
  {
    'namespace': 'dims',
    'ticket': {
      'prefix': 'ticket'
    },
    'file': {
      'prefix': 'file',
      'globalRoot': '_global'
    },
    'userSetting': {
      'prefix': 'userSetting'
    },
    'attribute': {
      'prefix': 'attribute'
    },
    'authaccount': {
      'prefix': 'authaccount'
    },
    'notification': {
      'prefix': 'notification'
    },
    'data': {
      'prefix': 'data'
    },
    'query': {
      'prefix': 'query'
    },
    'ticketTypes': ['mitigation', 'activity'],
    'topicTypes': ['silk', 'cif', 'crosscor', 'cidrs', 'mitigation', 'data'],
    'topicDataTypes': ['set', 'string'],
    'delimiter': ':',
    'contentDelimiter': '/'
  };

var isValidTicketType = function isValidTicketType(type) {
  return _.includes(config.ticketTypes, type);
};

var isValidTopicDataType = function isValidTopicDataType(type) {
  return _.includes(config.topicDataTypes, type);
};


module.exports.makeBase = makeBase;
module.exports.makeSuffix = makeSuffix;
module.exports.makeRoot = makeRoot;
module.exports.makeBase = makeBase;
module.exports.addContent = addContent;
module.exports.addSuffix = addSuffix;
module.exports.config = config;
module.exports.isValidTicketType = isValidTicketType;
module.exports.isValidTopicDataType = isValidTopicDataType;

// EOF
