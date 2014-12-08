'use strict';

var config = require('../config');
var logger = require('../utils/logger');
var Ticket = require('../models/ticket');
var db = require('../utils/redisUtils');
var redisDB = require('../utils/redisDB');

// Use DB 4 for initial testing/debugging
redisDB.select(4, function(err, reply) {
      console.log('err ', err);
      console.log('reply', reply);
    });

// Get all tickets
exports.list = function(req, res) {
  // var user = req.user.get('ident');
  var ticket = new Ticket();
  ticket.getAllTickets().then(function(reply) {
    logger.debug('tickets route get reply ', reply);
    res.status(200).send({data: reply});
  }, function(err) {
    res.status(400).send(err.toString());
  });
};

//Get metadata for one ticket
exports.show = function(req, res) {
  // var user = req.user.get('ident');
  var ticket = new Ticket();
  ticket.getTicket(req.params.id).then
    (function(reply) {
      res.status(200).send({data: reply});
    }, function(err) {
      res.status(400).send(err.toString());
    });
};