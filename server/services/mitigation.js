'use strict';

var config = require('../config/config');
var logger = require('../utils/logger');
var Ticket = require('../models/ticket');
var KeyGen = require('../models/keyGen');
var db = require('../utils/redisUtils');
var redisDB = require('../utils/redisDB');
var q = require('q');



exports.processNewTicket = function (ticket, content) {

};

exports.populateMitigationTicket = function (ticket) {

};
