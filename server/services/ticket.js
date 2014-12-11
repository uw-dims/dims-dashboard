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

  // var ticket = new Ticket();
  // logger.debug('ticket.create creating ticket');
  // ticket.create({creator: creator, type: type}).then(function(reply){


}