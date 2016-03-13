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
 */

'use strict';

// Get the app configuration
var config = require('../config/config');
var logger = require('./logger')(module);
var dbConfig;
logger.info('Setting up Bookshelf');
// Set up postgresql connection data to user database
console.log('[+++] userdb values');
console.log('[+++] host', config.userDBHost);
console.log('[+++] user', config.userDBUser);
console.log('[+++] pass', config.userDBPass);
console.log('[+++] database', config.userDatabase);

if (config.userDBPass) {
  console.log('[+++]', 'Setting User database connection string with password');
  dbConfig = {
    client: 'postgresql',
    connection: {
      host: config.userDBHost,
      user: config.userDBUser,
      database: config.userDatabase,
      password: config.userDBPass
    }
  };
} else {
  console.log('[+++]', 'Setting User database connection string without password');
  dbConfig = {
    client: 'postgresql',
    connection: {
      host: config.userDBHost,
      user: config.userDBUser,
      database: config.userDatabase
    }
  };
}


// Initialize Bookshelf ORM and connect
var knex = require('knex')(dbConfig);
var Bookshelf = require('bookshelf')(knex, {debug: true});

// Add virtuals plug-in
Bookshelf.plugin('virtuals');

// export Bookshelf
module.exports = Bookshelf;

// EOF
