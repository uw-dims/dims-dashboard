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


 // Change test.skip to test to run these tests. Require access to
 // User database

'use strict';

var test = require('tape');

var _ = require('lodash-compat');
var q = require('q');

var config = require('../../../config/config');
var bluebird = require('bluebird');
var redis = require('redis');

var dbConfig,
    knex,
    Bookshelf,
    UserModel,
    userService,
    UserSettings,
    access,
    client;

test.skip('authorizations setup', function (assert) {
  client = bluebird.promisifyAll(redis.createClient());
  bluebird.promisifyAll(client.multi());
  process.env.NODE_DEBUG = redis;
  client.selectAsync(10).then (function (reply) {
  })
  .catch(function (err) {
    console.error(err.toString());
  });

  dbConfig = {
    client: 'postgresql',
    connection: {
      host: config.userDBHost,
      user: config.userDBUser,
      database: config.userDatabase
    },
    debug: true
  };

  knex = require('knex')(dbConfig);
  Bookshelf = require('bookshelf')(knex);
  UserModel = require('../../../models/user')(Bookshelf);
  Bookshelf.plugin('virtuals');

  userService = require('../../../services/user')(UserModel, Bookshelf);
  UserSettings = require('../../../models/userSettings')(client);
  access = require('../../../services/authorization')(userService, UserSettings);

  assert.end();
});


var failOnError = function (err, assert) {
  console.log(err);
  assert.fail(err);
  assert.end();
};

test.skip('authorizations', function (assert) {
  var username = 'lparsons';
  return access.authorizations(username)
  .then(function (reply) {
    console.log('authorizations for ', username);
    console.log(reply);
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test.skip('finish', function (assert) {
  client.flushdbAsync()
  .then(function (reply) {
    return client.quitAsync();
  })
  .then(function (reply) {
    knex.destroy(function (err, reply) {
      console.log(err, reply);
      assert.end();
    });
  })
  .catch(function (err) {
    console.error(err.toString());
    assert.end();
  });

});
