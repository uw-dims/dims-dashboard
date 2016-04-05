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

var bluebird = require('bluebird');
var redis = require('redis');

var client = bluebird.promisifyAll(redis.createClient());
bluebird.promisifyAll(client.multi());
client.selectAsync(10).then (function (reply) {
})
.catch(function (err) {
  console.error(err.toString());
});

var store = require('../../../models/store')(client);
var Ticket = require('../../../models/ticket')(store);
var Topic = require('../../../models/topic')(store);

var createOptions = function (creator, type, name, tg, privacy, description) {
  return {
    creator: creator,
    type: type,
    description: description,
    private: privacy,
    name: name,
    tg: tg
  };
};

var tg1 = 'dims1';

var createTickets = function createTickets() {
  var activityConfig1 = createOptions('testuser1', 'activity', 'Activity 1', tg1);
  var mitigationConfig1 = createOptions('testuser2', 'mitigation', 'Mitigation 1', tg1, false);
  var privateConfig1 = createOptions('testuser2', 'activity', 'Activity2', tg1, true);
  var activityConfig2 = createOptions('testuser2', 'activity', 'Activity 3', tg1, false);
  var ticket1 = Ticket.ticketFactory(activityConfig1);
  var ticket2 = Ticket.ticketFactory(mitigationConfig1);
  var ticket3 = Ticket.ticketFactory(privateConfig1);
  var ticket4 = Ticket.ticketFactory(activityConfig2);
  return q.all([
    ticket1.create(),
    ticket2.create(),
    ticket3.create(),
    ticket4.create()
  ])
  .then(function (reply) {
    return ticket4.close();
  })
  .catch(function (err) {
    throw err;
  });
};

var failOnError = function (err, assert) {
  console.log('TEST: Error ', err.stack);
  assert.fail(err);
  assert.end();
};

test('models/topic.js: TopicFactory returns topic object with metadata', function (assert) {
  setTimeout(function () {
    var topic, ticket;
    createTickets()
    .then(function () {
      return Ticket.getTicket('dims:ticket:activity:1');
    })
    .then(function (reply) {
      ticket = reply;
      topic = Topic.topicFactory(ticket, {
        name: 'cif',
        description: 'CIF results',
        datatype: 'string'
      });
      assert.ok(topic.hasOwnProperty('metadata'));
      assert.ok(topic.metadata.hasOwnProperty('name'));
      assert.ok(topic.metadata.hasOwnProperty('datatype'));
      assert.ok(topic.metadata.hasOwnProperty('parent'));
      return client.flushdbAsync();
    })
    .then(function () {
      assert.end();
    })
    .catch(function (err) {
      failOnError(err, assert);
    });
  }, 1000);
});

test('models/topic.js: string topic can be created', function (assert) {
  var topic, ticket;
  createTickets()
  .then(function () {
    return Ticket.getTicket('dims:ticket:activity:1');
  })
  .then(function (reply) {
    ticket = reply;
    topic = Topic.topicFactory(ticket, {
      name: 'cif',
      description: 'CIF results',
      datatype: 'string'
    });
    return topic.create('string data');
  })
  .then(function (reply) {
    assert.deepEqual(reply, ['OK', 1, 'OK'], 'reply from create is valid');
    return store.getData('dims:ticket:activity:1:topic:1');
  })
  .then(function (reply) {
    assert.deepEqual(reply, 'string data', 'string data was saved');
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/topic.js: set topic can be created', function(assert) {
  var topic, ticket;
  createTickets()
  .then(function () {
    return Ticket.getTicket('dims:ticket:activity:1');
  })
  .then(function (reply) {
    ticket = reply;
    topic = Topic.topicFactory(ticket, {
      name: 'cif',
      description: 'CIF results',
      datatype: 'set'
    });
    // console.log(topic);
    // Will add these items to a set
    return topic.create(['1', '2', '3']);
  })
  .then(function (reply) {
    assert.deepEqual(reply, ['OK', 1, 3], 'correct responses received');
    return store.listItems('dims:ticket:activity:1:topic:1');
  })
  .then(function (reply) {
    assert.deepEqual(reply.sort(), ['1', '2', '3'], 'set data was saved');
    return store.listItems('dims:ticket:activity:1.__topics');
  })
  .then(function (reply) {
    assert.deepEqual(reply, ['dims:ticket:activity:1:topic:1'], 'key was saved in topic set');
    return store.getMetadata('dims:ticket:activity:1:topic:1.__meta');
  })
  .then(function (reply) {
    assert.equal(reply.name, 'cif', 'name was saved in metadata');
    assert.equal(reply.datatype, 'set', 'datatype was saved in metadata');
    assert.equal(reply.num, '1', 'num was saved in metadata');
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/topic.js: topic object can be retrieved', function (assert) {
  var topic, ticket;
  createTickets()
  .then(function () {
    return Ticket.getTicket('dims:ticket:activity:1');
  })
  .then(function (reply) {
    ticket = reply;
    topic = Topic.topicFactory(ticket, {
      name: 'cif',
      description: 'CIF results',
      datatype: 'string'
    });
    return topic.create('string data');
  })
  .then(function (reply) {
    assert.deepEqual(reply, ['OK', 1, 'OK']);
    return Topic.getTopic('dims:ticket:activity:1:topic:1');
  })
  .then(function (reply) {
    // assert.equal(reply, 'string data', 'string data was saved');
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/topic.js: can retrieve topic with data', function (assert) {
  var topic1, topic2, ticket;
  createTickets()
  .then(function () {
    return Ticket.getTicket('dims:ticket:activity:1');
  })
  .then(function (reply) {
    ticket = reply;
    topic1 = Topic.topicFactory(ticket, {
      name: 'cif',
      description: 'CIF results',
      datatype: 'string'
    });
    topic2 = Topic.topicFactory(ticket, {
      name: 'cif',
      description: 'CIF results',
      datatype: 'set'
    });
    // console.log(topic);
    return topic1.create('string data');
  })
  .then(function (reply) {
    assert.deepEqual(reply, ['OK', 1, 'OK']);
    return Topic.getTopic('dims:ticket:activity:1:topic:1');
  })
  .then(function (reply) {
    return topic2.create({ data: {'one': 'two'}});
  })
  .then(function (reply) {
    return Topic.getTopic('dims:ticket:activity:1:topic:2');
  })
  .then(function (reply) {
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/topic.js: can retrieve topics for a ticket with data', function (assert) {
  var topic1, topic2, ticket;
  createTickets()
  .then(function () {
    return Ticket.getTicket('dims:ticket:activity:1');
  })
  .then(function (reply) {
    ticket = reply;
    topic1 = Topic.topicFactory(ticket, {
      name: 'cif',
      description: 'CIF results',
      datatype: 'string'
    });
    topic2 = Topic.topicFactory(ticket, {
      name: 'cif',
      description: 'CIF results 2',
      datatype: 'set'
    });
    // console.log(topic);
    return topic1.create('string data');
  })
  .then(function (reply) {
    assert.deepEqual(reply, ['OK', 1, 'OK']);
    return topic2.create([1, 2, 3]);
  })
  .then(function (reply) {
    return Topic.getTopics('dims:ticket:activity:1');
  })
  .then(function (reply) {
    // assert.equal(reply, 'string data', 'string data was saved');
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/topic.js: Finished', function (assert) {
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


