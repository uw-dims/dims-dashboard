'use strict';

var _ = require('lodash-compat'),
    stream = require('stream'),
    util = require('util'),
    q = require('q'),

    config = require('../config/config'),
    c = require('../config/redisScheme'),
    keyGen = require('./keyGen'),
    extract = require('./keyExtract'),
    logger = require('../utils/logger')(module),
    dimsUtils = require('../utils/util');

module.exports = function Notification(db) {

};
