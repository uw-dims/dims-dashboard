// File: server/services/ticket.js

/** @module services/ticket */

'use strict';

// Includes
var diContainer = require('./diContainer');
var config = require('../config/config');
var logger = require('../utils/logger')(module);
var KeyGen = require('../models/keyGen');
var q = require('q');
var _ = require('lodash-compat');

module.exports = function (Ticket, Topic) {
  var ticketService = {};

  // Returns ticket metadata and array of topic metadata
  var listTickets = function listTickets(config) {
    var result = [];
    return Ticket.getTickets(config)
    .then(function (reply) {
      _.forEach(reply, function (value, key) {
        var ticket = value;
        ticket.topics = [];

      })
    })
  };

  var addTopics = function addTopics(ticket) {
    var result = ticket;
    return Topic.getTopicsMetadata(ticket.key)
    .then(function (reply) {
      
    })
  }

  var getTicket = function showTicket(id) {
    console.log('showTicket id ', id);
    return Ticket.getTicket(id)
    .then(function (reply) {
      return Topic.getTopics(reply.key);
    })
    .catch(function (err) {
      throw err;
    });
  };

  var createTicket = function createTicket(config) {
    var ticket = Ticket.ticketFactory(config);
    return ticket.create();
  };

  var updateTicket = function updateTicket(id, description) {
    return Ticket.getTicket(id)
    .then(function (reply) {

    })
    .catch(function (err) {
      throw err;
    });
  };

  var deleteTicket = function deleteTicket(id) {
    return Ticket.getTicket(id)
    .then(function (reply) {

    })
    .catch(function (err) {
      throw err;
    });
  };

  var addTopic = function addTopic(id, config) {
    return Ticket.getTicket(id)
    .then(function (reply) {

    })
    .catch(function (err) {
      throw err;
    });
  };

  ticketService.listTickets = listTickets;
  ticketService.getTicket = getTicket;
  ticketService.createTicket = createTicket;
  ticketService.updateTicket = updateTicket;
  ticketService.deleteTicket = deleteTicket;
  ticketService.addTopic = addTopic;

  return ticketService;

}


