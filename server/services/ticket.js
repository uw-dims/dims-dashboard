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
    console.log('in listTickets, config is ', config);
    var promises = [];
    _.forEach(config, function (value, index) {
      console.log('in listTickets for each, value is ', value);
      promises.push(listTicket(value));
    });
    return q.all(promises)
    .catch(function (err) {
      console.log('caught error in listTickets', err);
      throw err;
    });
  };

  var listTicket = function listTicket(config) {
    console.log('in listTicket, config is ', config);
    var promises = [];
    return Ticket.getTickets(config)
    .then(function (reply) {
      console.log('reply in listTicket', reply);
      _.forEach(reply, function (value, key) {
        var ticket = value;
        promises.push(addTopics(ticket));
      });
      return q.all(promises);
    })
    .catch(function (err) {
      console.log('caught error in listTicket', err);
      throw err;
    });
  };

  var addTopics = function addTopics(ticket) {
    var result = ticket;
    // console.log('addTopics input ticket', ticket);
    return Topic.getTopicsMetadata(ticket.key)
    .then(function (reply) {
      // console.log('addtopics reply', reply);
      result.topics = reply;
      return result;
    })
    .catch(function (err) {
      throw err;
    });
  };

  var getTicket = function getTicket(id) {
    console.log('showTicket id ', id);
    return Ticket.getTicket(id)
    .then(function (reply) {
      return addTopics(reply);
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


