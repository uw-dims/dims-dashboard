'use strict';

// ticket model
var config = require('../config');
var redisScheme = require('../redisScheme');
var logger = require('../utils/logger');
var q = require('q');

exports = module.exports = Ticket;

function Ticket(client, user, type) {
	var self = this;
	self.client = client;
	self.user = user;

	// Redis set that holds all keys for tickets
	self.keySet = redisScheme.tickets.set;
	// Construct key for this user
	self.key = redisScheme.tickets.prefix

};
