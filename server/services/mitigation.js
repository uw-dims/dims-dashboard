'use strict';

var config = require('../config/config');
var logger = require('../utils/logger')(module);
var Ticket = require('../models/ticket');
var KeyGen = require('../models/keyGen');
var db = require('../utils/redisProxy');
var redisDB = require('../utils/redisDB');
var q = require('q');



exports.processNewTicket = function (ticket, content) {

};

exports.populateMitigationTicket = function (ticket) {

};
