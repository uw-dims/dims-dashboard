'use strict';

var config = require('../config');
var logger = require('../utils/logger');
var Ticket = require('../models/ticket');
var KeyGen = require('../models/keyGen');
var db = require('../utils/redisUtils');
var redisDB = require('../utils/redisDB');

exports.getTicket = function(key, user) {
  var metadata,
      dataKey,
      data;

  var ticket = new Ticket();
  ticket.getTicket(key).then(function(ticket) {
    metadata = ticket.getTicketMetadata();
    dataKey = KeyGen.ticketKey() + metadata.type + 'data';
    // Get the data
    return db.hgetall(dataKey);
  }).then(function(reply) {
    data = reply;
    return {
      metadata: metadata,
      data: data
    };
  });
};

exports.createTicket = function(user) {
  var config = {
    creator: user,
    type: 'mitigation'
  };
  var ticket = new Ticket();
  ticket.createTicket(config).then(function(ticket) {

  }).then(function() {

  })
};

exports.createSetTopic = function(ticket, type, name, contentType, content) {
  // var deferred = q.defer();

};

exports.createHashTopic = function(ticket, type, name, contentType, content) {

};


