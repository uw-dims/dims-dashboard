// File: server/services/ticket.js

/** @module services/ticket */

'use strict';

// Includes
var config = require('../config');
var logger = require('../utils/logger');
var Ticket = require('../models/ticket');
var KeyGen = require('../models/keyGen');
var db = require('../utils/redisUtils');
var redisDB = require('../utils/redisDB');
var q = require('q');

/** Creates a ticket plus associated topics if required by supplied ticket type */
module.exports.createTicket = function(type, creator) {
  var deferred = q.defer();
  var ticket = new Ticket();
  var data;
  logger.debug('services/ticket.createTicket creating ticket');
  ticket.create(type, creator).then(function(reply){
    // reply is the ticket object
    logger.debug('services/ticket.createTicket Reply from ticket create is ', reply);
    if (type === 'mitigation') {
      // process a mitigation ticket - add required topics
      mitigation.processNewTicket(reply).then(function(reply) {
        data = mitigation.packageTicket(reply);
        deferred.resolve(data);
      });
    } else {
      // Package ticket into data reply, no extra processing necessary
      data = _packageBaseTicket(reply);
      logger.debug('services/ticket data returned from packaging is ', data);
      deferred.resolve(data);
    }
  });
  return deferred.promise;
};

/** 
module.exports.packageTicket = function() {

}
*/

var _packageBaseTicket = function(ticket) {
  var data = {};
  data.ticket = ticket;
  data.key = KeyGen.ticketKey(ticket);
  logger.debug('services/ticket._packageBaseTicket data is now ', data);
  return data;
};

