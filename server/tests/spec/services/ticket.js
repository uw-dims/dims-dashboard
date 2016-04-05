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

var test = require('tape');

var _ = require('lodash-compat');
var q = require('q');

var config = require('../../../config/config');
var logger = require('../../../utils/logger')(module);
var keyGen = require('../../../models/keyGen');
var extract = require('../../../models/keyExtract');

var bluebird = require('bluebird');
var redis = require('redis');

var client = bluebird.promisifyAll(redis.createClient());
bluebird.promisifyAll(client.multi());
client.selectAsync(10).then (function (reply) {
})
.catch(function (err) {
  console.error(err.toString());
});

var failOnError = function (err, assert) {
  console.log(err);
  assert.fail(err);
  assert.end();
};

var store = require('../../../models/store')(client);
var Ticket = require('../../../models/ticket')(store);
var Topic = require('../../../models/topic')(store);
var ticketService = require('../../../services/ticket')(Ticket, Topic);

var createTicketOptions = function (creator, type, name, tg, privacy, description) {
  return {
    creator: creator,
    type: type,
    description: description,
    private: privacy,
    name: name,
    tg: tg
  };
};

var createTickets = function () {
  var config1 = createOptions('testuser1', 'activity', 'activity1', 'tg1', false, 'desc1');
  var config2 = createOptions('testuser2', 'activity', 'activity2', 'tg1', false, 'desc2');
  var config3 = createOptions('testuser1', 'activity', 'activity3', 'tg1', false, 'desc3');
  var config4 = createOptions('testuser2', 'activity', 'activity4', 'tg1', false, 'desc4');
  var ticket1 = Ticket.ticketFactory(config1);
  var ticket2 = Ticket.ticketFactory(config2);
  var ticket3 = Ticket.ticketFactory(config3);
  var ticket4 = Ticket.ticketFactory(config4);
  return q.all([ticket1.create(), ticket2.create(), ticket3.create(), ticket4.create()]);
};

test('services/ticket.js', function (assert) {
  setTimeout(function () {
    ticketService.createTicket(createTicketOptions('testuser3', 'activity', 'activity1', 'tg1'))
    .then(function (reply) {
      console.log(reply);
      return client.flushdbAsync();
    })
    .then(function (reply) {
      assert.end();
    })
    .catch(function (err) {
      console.log(err);
      assert.end();
    });
  }, 1000);
});

test('services/ticket.js: Finished', function (assert) {
  client.flushdbAsync()
  .then(function (reply) {
    return client.quitAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    console.error(err.toString());
    assert.end();
  });
});
