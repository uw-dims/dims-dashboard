'use strict';

var pg = require('pg');

// Get the app configuration
var config = require('../config/config');
var logger = require('./logger');
logger.info('utils.bookshelf: Setting up Bookshelf');
// Set up postgresql connection data to user database
var dbConfig = {
  client: 'postgresql',
  connection: {
    host: config.userDBHost,
    user: config.userDBUser,
    database: config.userDatabase
  }
};

// Initialize Bookshelf ORM and connect
var knex = require('knex')(dbConfig);
var Bookshelf = require('bookshelf')(knex, {debug: true});

// Add virtuals plug-in
Bookshelf.plugin('virtuals');

// export Bookshelf
module.exports = Bookshelf;

// EOF
