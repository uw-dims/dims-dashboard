'use strict';

/**
  * file: models/ticket.js
  */

var config = require('../config/config'),
    keyGen = require('./keyGen'),
    keyExtract = require('./keyExtract'),
    logger = require('../utils/logger')(module),
    q = require('q'),
    _ = require('lodash-compat');

module.exports = function Ticket(store) {

  var timestamp = function () {
    var now = new Date().getTime();
    return now;
  };

  var ticketTypes = {
    'mitigation': {
      name: 'mitigation'
    },
    'activity': {
      name: 'activity'
    }
  };

  var validOptions = {
    creator: 'creator',
    type: 'type',
    description: 'description',
    private: 'private',
    name: 'name'
  };

  var isValidType = function (type) {
    if (!ticketTypes[type]) {
      return false;
    } else {
      return true;
    }
  };

  var validateConfig = function (config) {
    var defaultConfig = {
      description: '',
      private: false
    };
    // var newConfig = _.extend({}, defaultConfig, config);
    _.defaults(config, defaultConfig);
    // Must contain creator and type
    if (!config[validOptions.creator] || !config[validOptions.type] || !config[validOptions.name]) {
      return null;
    }
    // Type must be valid
    if (!isValidType(config.type)) {
      return null;
    }
    if (typeof config.private !== 'boolean') {
      return null;
    }
    return {
      creator: config.creator,
      description: config.description,
      type: config.type,
      private: config.private,
      name: config.name
    };
  };

  // Coerce types returned from redis
  var castMetadata = function castMetadata(metadata) {
    metadata.createdTime = _.parseInt(metadata.createdTime);
    metadata.modifiedTime = _.parseInt(metadata.modifiedTime);
    metadata.num = _.parseInt(metadata.num);
    metadata.open = metadata.open === 'true' ? true : false;
    metadata.private = metadata.private === 'true' ? true : false;
    return metadata;
  };

  // Add key to a set with current time as score
  var saveKey = function addToSet(metadata, setKey) {
    return store.addItem(keyGen.ticketKey(metadata), setKey, timestamp());
  };

  var saveMetadata = function saveMetadata(metadata) {
    return store.setMetadata(keyGen.ticketKey(metadata), metadata);
  };

  var removeKey = function removeKey(metadata, setKey) {
    return store.removeItem(keyGen.ticketKey(metadata), setKey);
  };

  var getMetadata = function getMetadata(key) {
    // Get metadata from store
    return store.getMetadata(key)
    .then(function (reply) {
      // coerce types
      if (reply !== null) {
        return castMetadata(reply);
      } else {
        return null;
      }
    })
    .catch(function (err) {
      throw err;
    });
  };

  var ticketPrototype = {

    close: function close() {
      var self = this;
      return self.exists()
      .then(function (reply) {
        if (reply) {
          self.metadata.open = false;
          self.metadata.modifiedTime = timestamp();
          return q.all([
            saveMetadata(self.metadata),
            removeKey(self.metadata, keyGen.ticketOpenKey()),
            saveKey(self.metadata, keyGen.ticketClosedKey())
          ]);
        } else {
          throw new Error('Cannot close a ticket that does not exist');
        }
      })
      .catch(function (err) {
        throw err;
      });
    },

    open: function open() {
      var self = this;
      return self.exists()
      .then(function (reply) {
        if (reply) {
          self.metadata.open = true;
          self.metadata.modifiedTime = timestamp();
          return q.all([
            saveMetadata(self.metadata),
            removeKey(self.metadata, keyGen.ticketClosedKey()),
            saveKey(self.metadata, keyGen.ticketOpenKey())
          ]);
        } else {
          throw new Error('Cannot open a ticket that does not exist');
        }
      })
      .catch(function (err) {
        throw err;
      });
    },

    makePrivate: function makePrivate() {
      var self = this;
      return self.exists()
      .then(function (reply) {
        if (reply) {
          self.metadata.private = true;
          self.metadata.modifiedTime = timestamp();
          return q.all([
            saveMetadata(self.metadata),
            removeKey(self.metadata, keyGen.ticketPublicKey()),
            saveKey(self.metadata, keyGen.ticketPrivateKey())
          ]);
        } else {
          throw new Error('Cannot make private a ticket that does not exist');
        }
      })
      .catch(function (err) {
        throw err;
      });
    },

    makePublic: function makePublic() {
      var self = this;
      return self.exists()
      .then(function (reply) {
        if (reply) {
          self.metadata.private = false;
          self.metadata.modifiedTime = timestamp();
          return q.all([
            saveMetadata(self.metadata),
            removeKey(self.metadata, keyGen.ticketPrivateKey()),
            saveKey(self.metadata, keyGen.ticketPublicKey())
          ]);
        } else {
          throw new Error('Cannot make public a ticket that does not exist');
        }
      })
      .catch(function (err) {
        throw err;
      });
    },

    updateDescription: function updateDescription(description) {
      var self = this;
      return self.exists()
      .then(function (reply) {
        if (reply) {
          self.metadata.modifiedTime = timestamp();
          self.description = description;
          return saveMetadata(self.metadata);
        } else {
          throw new Error('Cannot update a ticket that does not exist');
        }
      })
      .catch(function (err) {
        throw err;
      });
    },

    deleteTicket: function deleteTicket() {
      var self = this;
      var privKey, openKey;
      if (self.metadata.private) {
        privKey = keyGen.ticketPrivateKey();
      } else {
        privKey = keyGen.ticketPublicKey();
      }
      if (self.metadata.open) {
        openKey = keyGen.ticketOpenKey();
      } else {
        openKey = keyGen.ticketClosedKey();
      }
      return q.all([
        store.deleteKey(keyGen.ticketKey(self.metadata)),
        removeKey(self.metadata, keyGen.ticketSetKey()),
        removeKey(self.metadata, keyGen.ticketOwnerKey(self.metadata.creator)),
        removeKey(self.metadata, openKey),
        removeKey(self.metadata, keyGen.ticketTypeKey(self.metadata.type)),
        removeKey(self.metadata, privKey)
      ]);
    },

    exists: function exists() {
      var self = this;
      return store.existsInSet(keyGen.ticketKey(self.metadata), keyGen.ticketSetKey());
    },

    create: function create() {
      var self = this;
      var privKey;
      self.metadata.createdTime = timestamp();
      self.metadata.modifiedTime = self.metadata.createdTime;
      self.metadata.open = true;
      self.key = keyGen.ticketKey(self.metadata);
      // Increment the ticket counter
      return store.incrCounter(keyGen.ticketCounterKey())
      .then(function (reply) {
        // Save the counter value
        self.metadata.num = reply;
        if (self.metadata.private) {
          privKey = keyGen.ticketPrivateKey();
        } else {
          privKey = keyGen.ticketPublicKey();
        }
        // Save the ticket
        return q.all([
          saveMetadata(self.metadata),
          saveKey(self.metadata, keyGen.ticketSetKey()),
          saveKey(self.metadata, keyGen.ticketOwnerKey(self.metadata.creator)),
          saveKey(self.metadata, keyGen.ticketOpenKey()),
          saveKey(self.metadata, keyGen.ticketTypeKey(self.metadata.type)),
          saveKey(self.metadata, privKey)
        ]);
      })
      .then(function (reply) {
        return {
          key: keyGen.ticketKey(self.metadata),
          metadata: self.metadata
        };
      })
      .catch(function (err) {
        // logger.error('models/Ticket.create had an err returned from redis', err.toString());
        throw err;
      });
    },

    // returns properties of the current ticket object as one config
    // Simple getter for the object metadata
    getTicketMetadata: function getTicketMetadata() {
      var self = this;
      return self.metadata;
    }

  };

  // Factory function to create an unsaved ticket object
  var ticketFactory = function ticketFactory(options) {
    var metadata = {};
    if (options === null || options === undefined) {
      return new Error('Failed to provide options to ticketFactory');
    } else {
      if (validateConfig(options) !== false) {
        metadata = {
          metadata: validateConfig(options)
        };
      } else {
        throw new Error ('Invalid options supplied to ticketFactory');
      }
      // console.log(metadata);
      return (_.extend({}, ticketPrototype, metadata));
    }
  };

  // all, open, closed, owned, of a particular type
  /**
    {
      type: one of: all, activity, mitigation
      ownedBy: user,
      open: true or false,
      private: true or false
    }
  */

  var validateQuery = function validateQuery(options) {
    var result = {};
    if (!options['type']) {
      return null;
    }
    // Type must be valid
    if (!isValidType(options.type) && options.type !== 'all') {
      return null;
    }
    if (options.hasOwnProperty('private')) {
      if (typeof options.private !== 'boolean') {
        return null;
      }
    }
    if (options.private && !options['ownedBy']) {
      return null;
    }
    if (options.hasOwnProperty('open')) {
      if (typeof options.open !== 'boolean') {
        return null;
      }
    }
    result.type = options.type;
    if (options['private']) {
      result.private = options.private;
    }
    if (options['ownedBy']) {
      result.ownedBy = options.ownedBy;
    }
    if (options.hasOwnProperty('open')) {
      result.open = options.open;
    }
    return result;
  };

  var getTicketKeys = function getTicketKeys(options) {
    // console.log('getTicketKeys options', options);
    var keyArray = [];
    var query = validateQuery(options);
    if (query === null) {
      console.log('throw error for invalid query');
      return q.fcall(function () {
        throw new Error('Invalid query supplied to retrieve tickets');
      })
    }
    if (query.type === 'all') {
      keyArray.push(keyGen.ticketSetKey());
    }
    if (query.type === 'activity' || query.type === 'mitigation') {
      keyArray.push(keyGen.ticketTypeKey(query.type));
    }
    if (query.hasOwnProperty('private')) {
      if (query.private) {
        keyArray.push(keyGen.ticketPrivateKey());
      } else {
        keyArray.push(keyGen.ticketPublicKey());
      }
    }
    if (query.hasOwnProperty('open') ) {
      if (query.open) {
        keyArray.push(keyGen.ticketOpenKey());
      } else {
        keyArray.push(keyGen.ticketClosedKey());
      }
    }
    if (query.hasOwnProperty('ownedBy')) {
      keyArray.push(keyGen.ticketOwnerKey(query.ownedBy));
    }
    // console.log('getTicketKeys. keyArray is ', keyArray);
    return store.intersectItems(keyArray);
  };

  // var completeTicket = function completeTicket(config) {
  //   config = castMetadata(config);
  //   var ticket = ticketFactory({
  //     type: config.type,
  //     description: config.description,
  //     creator: config.creator,
  //     private: config.private
  //   });
  //   _.extend(ticket.metadata, config);
  //   ticket.key = keyGen.ticketKey(ticket.metadata);
  //   return ticket;
  // };

  // Returns ticket metadata and key
  // Does not create full ticket object with functions
  var getTicket = function getTicket(key) {
    return getMetadata(key)
    .then(function (reply) {
      if (reply !== null) {
        return {
          key: key,
          metadata: reply
        };
      } else {
        return null;
      }
    })
    .catch(function (err) {
      throw err;
    });
  };

  var getTickets = function getTickets(options) {
    var promises = [];
    return getTicketKeys(options)
    .then(function (reply) {
      _.forEach(reply, function (value, index) {
        promises.push(getTicket(value));
      });
      return q.all(promises);
    })
    .catch(function (err) {
      console.log('caught error in getTickets');
      throw err;
    });
  };

  // Extends ticket retrieved from store to full ticket object with
  // functions. Includes key as well.
  var extendFactory = function extendFactory(config) {
    var ticketObject = ticketFactory({
      type: config.metadata.type,
      description: config.metadata.description,
      creator: config.metadata.creator,
      private: config.metadata.private
    });
    _.extend(ticketObject.metadata, config.metadata);
    ticketObject.key = config.key;
    return ticketObject;
  };

  // This is what we're exposing publicly
  var ticket = {
    // Factory to create a new ticket object
    ticketFactory: ticketFactory,
    // Static method to return a ticket populated from the
    // database for a given key
    getTicket: getTicket,
    // Static method to return array of tickets
    getTickets: getTickets,
    // extends ticket data from store to include functions
    extendFactory: extendFactory
  };

  // If testing, export some private functions so we can test them
  if (process.env.NODE_ENV === 'test') {
    ticket._private = {
      castMetadata: castMetadata,
      validateConfig: validateConfig,
      validateQuery: validateQuery,
      getTicketKeys: getTicketKeys
    };
  }

  return ticket;
};

