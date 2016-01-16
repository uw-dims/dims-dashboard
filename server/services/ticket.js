// File: server/services/ticket.js

/** @module services/ticket */

'use strict';

// Includes
var logger = require('../utils/logger')(module);
var q = require('q');
var _ = require('lodash-compat');

module.exports = function (Ticket, Topic) {
  var ticketService = {};

  // Returns ticket metadata and array of topic metadata
  var listTickets = function listTickets(config) {
    var promises = [];
    _.forEach(config, function (value, index) {
      promises.push(listTicket(value));
    });
    return q.all(promises)
    .catch(function (err) {
      logger.debug('listTickets error', err.toString());
      throw err;
    });
  };

  var listTicket = function listTicket(config) {
    var promises = [];
    return Ticket.getTickets(config)
    .then(function (reply) {
      _.forEach(reply, function (value, key) {
        var ticket = value;
        promises.push(addTopics(ticket));
      });
      return q.all(promises);
    })
    .catch(function (err) {
      logger.debug('listTicket error', err);
      throw err;
    });
  };

  var addTopics = function addTopics(ticket) {
    var result = ticket;
    return Topic.getTopicsMetadata(ticket.key)
    .then(function (reply) {
      result.topics = reply;
      return result;
    })
    .catch(function (err) {
      logger.debug('addTopics error', err);
      throw err;
    });
  };

  var getTicket = function getTicket(id) {
    return Ticket.getTicket(id)
    .then(function (reply) {
      return addTopics(reply);
    })
    .catch(function (err) {
      logger.debug('getTicket error', err);
      throw err;
    });
  };

  var createTicket = function createTicket(config) {
    var ticket = Ticket.ticketFactory(config);
    return ticket.create();
  };

  // TODO: Finish this method
  var updateTicket = function updateTicket(id, description) {
    return Ticket.getTicket(id)
    .then(function (reply) {

    })
    .catch(function (err) {
      throw err;
    });
  };

  // TODO: Finish this method
  var deleteTicket = function deleteTicket(id) {
    return Ticket.getTicket(id)
    .then(function (reply) {

    })
    .catch(function (err) {
      throw err;
    });
  };

  // TODO: Finish this method
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
  // ticketService.addTopic = addTopic;

  // If testing, export some private functions so we can test them
  if (process.env.NODE_ENV === 'test') {
    ticketService._private = {
      castMetadata: castMetadata,
      validateConfig: validateConfig,
      validateQuery: validateQuery,
      getTicketKeys: getTicketKeys
    };
  }

  return ticketService;

};


