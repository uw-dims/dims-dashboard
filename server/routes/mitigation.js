'user strict';

// API for mitigation

var config = require('../config');
var logger = require('../utils/logger');
var Ticket = require('../models/ticket');
var mitigation = require('../services/mitigation');

var redisDB = require('../utils/redisDB');

// Use DB 4 for initial testing/debugging
redisDB.select(4, function(err, reply) {
      console.log('err ', err);
      console.log('reply', reply);
    });

// Get a mitigation ticket
exports.show = function(req,res) {
    // var user = req.user.get('ident');
    var user = 'lparsons';
    var results = mitigation.getTicket(req.params.id, user);
    res.status(200).send({data: results});
    // here we need to return the ticket metadata, as well as
    // id:data - for data to graph
    // id:user:<user> - for ips to mitigate
    // so
    // return get ips if any
    // then return get data
    // then return response

};

exports.create = function(req, res) {
  // var user = req.user.get('ident');
  var user = 'lparsons';
  // create a mitigation ticket
  // post will contain ips (or path to file)
  config = {
    type: 'mitigation',
    user: user
  };
  var ticket = new Ticket();
  ticket.create(config).then(function(ticket) {
    res.status(200).send({data: ticket.num});
    // Now need to call function to process the ticket
    // create topics

  });

};

// Update a mitigation ticket. The post data will be
// the IPs to mitigate
// This will return the current state of the ticket after
// processing
exports.update = function(req, res) {

}