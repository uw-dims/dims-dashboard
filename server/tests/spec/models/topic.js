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

var createOptions = function (creator, type, name, privacy, description) {
  return {
    creator: creator,
    type: type,
    description: description,
    private: privacy,
    name: name
  };
};

var createTickets = function createTickets() {
  console.log('start createTickets');
  var activityConfig1 = createOptions('testuser1', 'activity', 'Activity 1');
  var mitigationConfig1 = createOptions('testuser2', 'mitigation', 'Mitigation 1', false);
  var privateConfig1 = createOptions('testuser2', 'activity', 'Activity2', true);
  var activityConfig2 = createOptions('testuser2', 'activity', 'Activity 3', false);
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
    console.log('end createTickets');
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
      console.log(reply.metadata);
      ticket = reply;
      topic = Topic.topicFactory(ticket, {
        name: 'cif',
        description: 'CIF results',
        datatype: 'string'
      });
      console.log(topic);
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
    console.log('[+++] topicFactory result ', topic);
    return topic.create('string data');
  })
  .then(function (reply) {
    console.log('test after create', topic.metadata);
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
    console.log(reply);
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
    console.log('[+++] test topic object retrieved ', topic);
    return topic.create('string data');
  })
  .then(function (reply) {
    assert.deepEqual(reply, ['OK', 1, 'OK']);
    return Topic.getTopic('dims:ticket:activity:1:topic:1');
  })
  .then(function (reply) {
    console.log('test reply', reply);
    console.log('test ', reply.metadata);
    console.log('test', reply.metadata.parent);
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
    console.log('test reply', reply);
    console.log('test ', reply.metadata);
    console.log('test', reply.metadata.parent);
    return topic2.create({ data: {'one': 'two'}});
  })
  .then(function (reply) {
    console.log('reply from creating 2nd topic');
    return Topic.getTopic('dims:ticket:activity:1:topic:2');
  })
  .then(function (reply) {
    console.log(reply);
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
    console.log(reply);
    return Topic.getTopics('dims:ticket:activity:1');
  })
  .then(function (reply) {
    console.log('test reply', reply);
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


