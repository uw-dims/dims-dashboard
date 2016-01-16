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
