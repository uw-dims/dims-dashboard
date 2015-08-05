'use strict';

var logger = require('../utils/logger');

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

var makeRoot = function makeRoot(type) {
  // logger.debug('makeRoot type is ', type);
  var base  = {
    'ticket': function () {
      return config.namespace + config.delimiter + config.ticket.prefix;
    },
    'file': function () {
      return config.namespace + config.delimiter + config.file.prefix;
    },
    'userSetting': function () {
      return config.namespace + config.delimiter + config.userSetting.prefix;
    },
    'notification': function () {
      return config.namespace + config.delimiter + config.notification.prefix;
    },
    'data': function () {
      return config.namespace + config.delimiter + config.data.prefix;
    },
    'query': function () {
      return config.namespace + config.delimiter + config.query.prefix;
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
    key = key + config.delimiter + item;
  });
  return key;
};

// Add content to a base key - useful when constructing keys from other keys
// Options are key plus a variable number of content items
var addContent = function (options) {
  var args = [].slice.call(arguments, 0);
  var key = args[0];
  args.shift();
  args.forEach(function (item) {
    key = key + config.delimiter + item;
  });
  return key;
};

// Add a suffix to a key
var addSuffix = function (key, suffixType, param) {
  return key + makeSuffix(suffixType, param);
};

// Add content to an existing key
// var addContentToKey = function (key, content) {
//   return key + config.delimiter + content;
// };

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
    'notification': {
      'prefix': 'notification'
    },
    'data': {
      'prefix': 'data'
    },
    'query': {
      'prefix': 'query'
    },
    'topicTypes': ['silk', 'cif', 'crosscor', 'cidrs', 'mitigation', 'data'],
    'delimiter': ':',
    'contentDelimiter': '/'
  };

module.exports.makeBase = makeBase;
module.exports.makeSuffix = makeSuffix;
module.exports.makeRoot = makeRoot;
module.exports.makeBase = makeBase;
module.exports.addContent = addContent;
module.exports.addSuffix = addSuffix;
module.exports.config = config;

// EOF
