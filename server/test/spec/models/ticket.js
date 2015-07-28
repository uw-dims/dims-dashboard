'use strict'

var test = require('tape-catch');

var logger = require('../../../utils/logger');
var _ = require('lodash-compat');

// Redis mock
// We will use blocking form for simplicity in test assertions
var client = require('redis-js').createClient();

// Need db as Ticket argument.
var db = require('../../../utils/redisUtils')(client);
var KeyGen = require('../../../models/keyGen');

var Ticket = require('../../../models/ticket')(db);

// Bootstrap some data
var user = 'testUser'; // Simulates logged in user

var topicName1 = 'topicHashData',
    topicDataType1 = 'hash',
    topicContents1 = {
      'field1': 'value1',
      'field2': 'value2'
    },
    topicName2 = 'topicStringData',
    topicDataType2 = 'string',
    // Set to one value until jenkins redis is updated from 2.2.10
    topicContents2 = 'aaaaaa',
    ticketType1 = 'data';

var createCounter = 0;
var savedTicket;
var savedKey;
var savedMeta;

var debugTicketCounter = function (ticket) {
  createCounter++;
  logger.debug('TEST:Ticket ' + createCounter + ' created: ', ticket.paramString());
};

var failOnError = function (err) {
  logger.debug('TEST: Error ', err);
  assert.fail(err);
  assert.end();
};

test('models/ticket.js: ticketFactory should return default ticket object', function (assert) {
  assert.plan(8);
  var newTicket = Ticket.ticketFactory();
  assert.equal(typeof (newTicket.create), 'function', 'Ticket has create function');
  assert.equal(typeof (newTicket.pullTicketMetadata), 'function', 'Ticket has pullTicketMetadata function');
  assert.equal(typeof (newTicket.getTicketMetadata), 'function', 'Ticket has getTicketMetadata function');
  assert.equal(newTicket.num, null, 'Ticket has default counter value');
  assert.equal(newTicket.creator, null, 'Ticket has default creator value');
  assert.equal(newTicket.type, null, 'Ticket has default type value');
  assert.equal(newTicket.createdTime, null, 'Ticket has default createdTime');
  assert.equal(newTicket.open, true, 'Ticket has default of open = true');
});

test('models/ticket.js: Created ticket should have a creator and type as supplied', function (assert) {
  assert.plan(2);
  var newTicket = Ticket.ticketFactory();
  newTicket.create(ticketType1, user)
  .then(function (ticket) {
    debugTicketCounter(ticket);
    assert.equal(ticket.type, ticketType1, 'type equals ' + ticketType1);
    assert.equal(ticket.creator, user, 'creator equals ' + user);
  })
  .catch(function (err) {
    logger.debug(err);
  });
});

test('models/ticket.js: Creating a ticket should generate a counter for the ticket', function (assert) {
  assert.plan(1);
  var newTicket = Ticket.ticketFactory();
  newTicket.create(ticketType1, user)
  .then(function (ticket) {
    debugTicketCounter(ticket);
    // Now retrieve the latest counter that was generated
    var key = KeyGen.ticketCounterKey();
    var result = client.get(key);
    assert.equal(parseInt(result), ticket.num, 'Latest counter generated equal ticket.num');
  })
  .catch(function (err) {
    logger.debug(err);
  });
});

test('models/ticket.js: Creating a ticket should save the ticket key in the set of all ticket keys', function (assert) {
  assert.plan(1);
  var newTicket = Ticket.ticketFactory();
  newTicket.create(ticketType1, user)
  .then(function (ticket) {
    debugTicketCounter(ticket);
    // Key to set of tickets
    var setKey = KeyGen.ticketSetKey();
    // Key to this ticket
    var ticketKey = KeyGen.ticketKey(ticket);
    // Rank should be greater than or equal to 0.
    assert.ok (client.zrank (setKey, ticketKey) >= 0, 'Ticket key was saved in ' + setKey);
  })
  .catch(function (err) {
    logger.debug(err);
  });
});

test('models/ticket.js: Creating a ticket should save the ticket metadata correctly in the database', function (assert) {
  var newTicket = Ticket.ticketFactory();
  newTicket.create(ticketType1, user)
  .then(function (ticket) {
    debugTicketCounter(ticket);
    // Key to this ticket
    var ticketKey = KeyGen.ticketKey(ticket);
    // Get the value pointed to by the key
    var reply = client.hgetall(ticketKey);
    assert.equal(reply.type, ticketType1, 'Type saved correctly');
    assert.equal(reply.creator, user, 'Creator saved correctly');
    assert.equal(reply.open, true, 'Open status saved correctly');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
  });
});

test('models/ticket.js: getAllTicket keys', function (assert) {
  // Will report number of ticket keys we have saved so far
  Ticket.getAllTicketKeys()
  .then(function (reply) {
    assert.equal(reply.length, 4, 'Array should have 4 keys');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
  });
});

test('models/ticket.js: getTicket should return populated ticket object', function (assert) {
  // Create the initial ticket
  var newTicket = Ticket.ticketFactory();
  var ticketMeta;
  newTicket.create(ticketType1, user)

  .then(function (meta) {
    debugTicketCounter(meta);
    var ticketKey = KeyGen.ticketKey(meta);
    ticketMeta = meta;
    //Now retrieve a ticket object via getTicket static method
    return Ticket.getTicket(ticketKey)
  })
  .then(function (reply) {
    // reply is the new ticket object
    assert.deepEqual(reply, newTicket, 'Retrieved ticket object equals original object');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
  });
});


test('models/ticket.js: addTopic should return topic object with correct metadata', function (assert) {
  var newTicket = Ticket.ticketFactory();
  newTicket.create(ticketType1, user)
  .then(function (meta) {
    debugTicketCounter(meta);
    return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
  })
  .then(function (reply) {
    assert.equal(typeof reply, 'object', 'Reply is an object');
    assert.equal(typeof (reply.save), 'function', 'Reply has save method');
    assert.equal(typeof (reply.setDataType), 'function', 'Reply has setDataType method');
    assert.equal(typeof (reply.getDataType), 'function', 'Reply has getDataType method');
    assert.equal(reply.parent.creator, user, 'Reply has correct parent.creator');
    assert.equal(reply.parent.type, ticketType1, 'Reply has correct parent.type');
    assert.equal(reply.parent.num, createCounter, 'Reply has correct parent counter');
    // Type of topic is same as parent
    assert.equal(reply.type, ticketType1, 'Reply topic type is the same as parent');
    assert.equal(reply.name, topicName1, 'Reply has correct topic name');
    assert.equal(reply.dataType, topicDataType1, 'Reply has correct topic dataType');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
  });
});

test('models/ticket.js: addTopic should return error if topic already exists', function (assert) {
  var newTicket = Ticket.ticketFactory();
  newTicket.create(ticketType1, user)
  .then(function (meta) {
    debugTicketCounter(meta);
    return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
  })
  .then(function (reply) {
    return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
  })
  .then(function (reply) {
    assert.ok(reply instanceof Error, 'Add topic that already exists should return an error');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
  });
});

test('models/ticket.js: addTopic should save the contents to the database correctly when dataType is hash', function (assert) {
  var newTicket = Ticket.ticketFactory();
  newTicket.create(ticketType1, user)
  .then(function (meta) {
    debugTicketCounter(meta);
    return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
  })
  .then(function (reply) {
    // Topic key
    var key = KeyGen.topicKey(reply);
    // Get value at key (hash)
    var result = client.hgetall(key);
    assert.deepEqual(result, topicContents1, 'Contents were saved correctly for hash');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
  });
});

test('models/ticket.js: addTopic should save the contents to the database correctly when dataType is string', function (assert) {
  var newTicket = Ticket.ticketFactory();
  newTicket.create(ticketType1, user)
  .then(function (meta) {
    debugTicketCounter(meta);
    return newTicket.addTopic(topicName2, topicDataType2, topicContents2);
  })
  .then(function (reply) {
    // Topic key
    var key = KeyGen.topicKey(reply);
    // Get value at key (string)
    var result = client.get(key);
    assert.equal(result, topicContents2, 'Contents were saved correctly for string');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
  });
});


test('models/ticket.js: addTopic should save the topic key to the set of topics for this ticket', function (assert) {
  var newTicket = Ticket.ticketFactory();
  newTicket.create(ticketType1, user)
  .then(function (meta) {
    debugTicketCounter(meta);
    return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
  })
    .then(function (reply) {
    // reply is topic object
    // setKey is key to set of Topics for this ticket
    var setKey = KeyGen.topicListKey(newTicket);
    // Key to this topic
    var topicKey = KeyGen.topicKey(reply);
    // Rank should be greater than or equal to 0.
    assert.ok(client.zrank(setKey, topicKey) >= 0, 'Set of topics for the ticket contains the topic key');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
  });
});


test('models/ticket.js: Topic.setDatatype should set the dataType of the topic object', function (assert) {
  var newTicket = Ticket.ticketFactory();
  newTicket.create(ticketType1, user).then(function (meta) {
    debugTicketCounter(meta);
    return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
  })
  .then(function (reply) {
    assert.equal(reply.dataType, topicDataType1, 'Original dataType is correct (from parent)');
    reply.setDataType(topicDataType2);
    assert.equal(reply.dataType, topicDataType2, 'DataType was modified');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
  });
});

test('models/ticket.js: Topic.getDataType should get the dataType from the database', function (assert) {
  var newTicket = Ticket.ticketFactory();
  newTicket.create(ticketType1, user).then(function (meta) {
    debugTicketCounter(meta);
    return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
  })
  .then(function (reply) {
    assert.equal(reply.dataType, topicDataType1, 'Original datatype as created');
    return reply.getDataType();
  })
  .then(function (result) {
    assert.equal(result, topicDataType1, 'getDataType returns the topic dataType');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
  });
});

test('models/ticket.js: Topic.getTopicMetadata should should return metadata from object', function (assert) {
  var newTicket = Ticket.ticketFactory();
  newTicket.create(ticketType1, user).then(function (meta) {
    debugTicketCounter(meta);
    return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
  })
  .then(function (reply) {
    var result = reply.getTopicMetadata();
    var expected = {
      parent: reply.parent,
      type: reply.type,
      name: reply.name,
      dataType: reply.dataType
    };
    assert.deepEqual(result, expected, 'getTopicMetadata returns metadata from object');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
  });
});

test('models/ticket.js: Topic.getContents should should return contents from database', function (assert) {
  var newTicket = Ticket.ticketFactory();
  var topicKey;
  newTicket.create(ticketType1, user).then(function (meta) {
    debugTicketCounter(meta);
    return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
  })
  .then(function (reply) {
    topicKey = KeyGen.topicKey(reply);
    return reply.getContents();
  })
  .then(function (result) {
    // Manually for test
    var hashresult = client.hgetall(topicKey, 'hash');
    assert.deepEqual(result, topicContents1, 'Contents retrieved from database');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
  });
});

test('models/ticket.js: Topic.exists should report the existence of the topic', function (assert) {
  var newTicket = Ticket.ticketFactory();
  newTicket.create(ticketType1, user).then(function (meta) {
    debugTicketCounter(meta);
    return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
  })
  .then(function (reply) {
    return reply.exists()
  })
  .then(function (result) {
    assert.ok(result, 'Existing topic reported as true');
    // Create a new topic for this ticket
    var newTopic = Ticket.topicFactory({
      parent: newTicket,
      type: newTicket.type,
      name: 'bob',
      dataType: 'string'
    });
    return newTopic.exists()
  })
  .then(function (result) {
    assert.notOk(result, 'Nonexisting topic reported as false');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
  });
});

test('models/ticket.js: Ticket.getTopicKeys should return the correct keys', function (assert) {
  var newTicket = Ticket.ticketFactory();
  var topicKey1,
      topicKey2;
  newTicket.create(ticketType1, user).then(function (meta) {
    debugTicketCounter(meta);
    return newTicket.addTopic(topicName2, topicDataType2, topicContents2);
  })
  .then(function (reply) {
    // Save key to this topic
    topicKey1 = KeyGen.topicKey(reply);
    return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
  })
  .then(function (reply) {
    // Save key to second topic
    topicKey2 = KeyGen.topicKey(reply);
    return newTicket.getTopicKeys();
  })
  .then(function (reply) {
    assert.ok(_.indexOf(reply, topicKey1) > -1, 'Result contains first key');
    assert.ok(_.indexOf(reply, topicKey2) > -1, 'Result contains second key');
    assert.equal(reply.length, 2, 'Result only contains 2 keys');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
  });
});

test('models/ticket.js: Ticket.topicFromKey creates topic object from key', function (assert) {
  var newTicket = Ticket.ticketFactory();
  var firstTopic;
  newTicket.create(ticketType1, user).then(function (meta) {
    debugTicketCounter(meta);
    return newTicket.addTopic(topicName2 + '2', topicDataType2, topicContents2);
  })
  .then(function (reply) {
    // Save topic
    firstTopic = reply;
    // Get the key
    var topicKey = KeyGen.topicKey(reply);
    return newTicket.topicFromKey(topicKey);
  })
  .then(function (reply) {
    // reply should equal firstTopic
    assert.deepEqual(reply, firstTopic, 'Topic created from key');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
  });
});

test('models/ticket.js: Ticket.getTopics should return array of Topic objects', function (assert) {
  var newTicket = Ticket.ticketFactory();
  var topicKey1, topic1,
      topicKey2, topic2;
  newTicket.create(ticketType1, user).then(function (meta) {
    debugTicketCounter(meta);
    return newTicket.addTopic(topicName2, topicDataType2, topicContents2);
  })
  .then(function (reply) {
    // Save the topic
    topic1 = reply;
    return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
  })
  .then(function (reply) {
    // Save second topic
    topic2 = reply;
    // Get the topics
    return newTicket.getTopics();
  })
  .then(function (reply) {
    assert.equal(reply.length, 2, 'Result only contains 2 topics');
    // Set is sorted by time, so these should be in time order
    assert.deepEqual(reply[0], topic1, 'First topic key in array');
    assert.deepEqual(reply[1], topic2, 'Second topic key in array');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
  });
});


