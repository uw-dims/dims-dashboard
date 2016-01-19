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
 * services/ticket.js
 *
 * This module provides the basic functions used by other modules to work with
 * tickets.
 */

'use strict';

// Includes
var logger = require('../utils/logger')(module);
var q = require('q');
var _ = require('lodash-compat');

// ticketService.listTickets = listTickets;
// ticketService.getTicket = getTicket;
// ticketService.createTicket = createTicket;
// ticketService.updateTicket = updateTicket;
// ticketService.deleteTicket = deleteTicket;
// ticketService.addTopic = addTopic;
// ticketService.updateTopic = updateTopic;
// ticketService.deleteTopic = deleteTopic;

module.exports = function (Ticket, Topic) {
  var ticketService = {};

  // Create a ticket described by the config parameter
  // Returns a promise with the
  // config properties:
  //   creator: (required) username of ticket creator
  //   type: (required) type of ticket - 'activity', 'mitigation'
  //   description: (optional - default is '') string description of ticket
  //   private: (optional - default is false) boolean
  //   name: (required) - name of ticket
  //   tg: (required) - trust group ticket belongs to
  //
  var createTicket = function createTicket(config) {
    var ticket = Ticket.ticketFactory(config);
    return ticket.create();
  };

  // Returns a promise with an array of tickets and their associated topics (metadata only)
  // queries is an array of query objects, so this method can
  // return results for multiple queries
  //
  // Query object properties:
  //   type: (optional) type of ticket: 'activity', 'mitigation'
  //   ownedBy: (optional) username of the ticket owner (creator)
  //   private: (optional) true if private, false if public
  //   open: (optional) true if open, false if closed
  //   tg: (optional) trust group
  var listTickets = function listTickets(queries) {
    var promises = [];
    _.forEach(queries, function (value, index) {
      promises.push(ticketQuery(value));
    });
    return q.all(promises)
  };

  // Returns a promise with a ticket and its associated topics (metadata only)
  // id: key of the ticket
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

  // Returns a promise
  // Updates a ticket's metadata
  var updateTicket = function updateTicket(id, description) {
    return Ticket.getTicket(id)
    .then(function (reply) {

    })
    .catch(function (err) {
      throw err;
    });
  };

  // Returns a promise with an array of tickets and associated
  // topics (metadata only)
  function ticketQuery(query) {
    var promises = [];
    return Ticket.getTickets(query)
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
  }

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



  var getTicketMetadata = function getTicketMetadata(id) {
    return Ticket.getTicket(id);
  };





  // TODO: Finish this method
  var deleteTicket = function deleteTicket(id) {
    var ticket,
        ticketMetadata,
        promises;
    return Ticket.getTicket(id)
    .then(function (reply) {
      ticket = Ticket.ticketFactory(reply.metadata);
      ticketMetadata = reply;
      return ticket.delete();
    })
    .then(function (reply) {
      return addTopics(ticketMetadata);
    })
    .then(function (reply) {
      _.forEach(reply, function (value) {
        promises.push(Topic.delete(value.key));
      });
      return q.all(promises);
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

  var getTopic = function getTopic() {

  };

  var updateTopic = function updateTopic() {

  };

  var deleteTopic = function deleteTopic() {

  };

  ticketService.listTickets = listTickets;
  ticketService.getTicket = getTicket;
  ticketService.createTicket = createTicket;
  ticketService.updateTicket = updateTicket;
  ticketService.deleteTicket = deleteTicket;
  ticketService.getTopic = getTopic;
  ticketService.addTopic = addTopic;
  ticketService.updateTopic = updateTopic;
  ticketService.deleteTopic = deleteTopic;

  // If testing, export some private functions so we can test them
  if (process.env.NODE_ENV === 'test') {
    ticketService._private = {
      // validateConfig: validateConfig,
      // validateQuery: validateQuery,
      // getTicketKeys: getTicketKeys
    };
  }

  return ticketService;

};


