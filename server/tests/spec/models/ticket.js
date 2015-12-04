'use strict';

var test = require('tape');
var _ = require('lodash-compat');
var q = require('q');

var config = require('../../../config/config');
var logger = require('../../../utils/logger')(module);
var keyGen = require('../../../models/keyGen');
var extract = require('../../../models/keyExtract');

// Enable service discovery for this test
// var diContainer = require('../../../services/diContainer')();
// var redis = require('redis');
// var client = redis.createClient();
// client.select(10, function (err, reply) {
//   if (err) {
//     console.error('test: redis client received error when selecting database ', err);
//     throw new Error(err);
//   }
// });
// diContainer.factory('db', require('../../../utils/redisProxy'));
// diContainer.register('client', client);

// diContainer.factory('Ticket', require('../../../models/ticket'));

// var Ticket = diContainer.get('Ticket');
// var db = diContainer.get('db');

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

// Bootstrap some data
var user = 'testUser'; // Simulates logged in user

// var topicName1 = 'topicHashData',
//     topicDataType1 = 'hash',
//     topicContents1 = {
//       'field1': 'value1',
//       'field2': 'value2'
//     },
//     topicName2 = 'topicStringData',
//     topicDataType2 = 'string',
//     // Set to one value until jenkins redis is updated from 2.2.10
//     topicContents2 = 'aaaaaa',
//     ticketType1 = 'data';

var createOptions = function (creator, type, description) {
  return {
    creator: creator,
    type: type,
    description: description
  };
};

var user1 = 'testuser';
var activityKey1 = 'dims:ticket:activity:1';
var mitigationKey1 = 'dims:ticket:activity:1';
var userKey1 = 'dims:ticket:' + user1 + ':1';
var ownerSetKey1 = 'dims:ticket.__owner.__' + user1;
var openSetKey = 'dims:ticket.__open';
var typeSetKey1 = 'dims:ticket.__type.__activity';
var ticketSetKey = 'dims:ticket.__keys';

var validOption1 = createOptions(user1, 'activity');
var expectedOption1 = createOptions(user1, 'activity');
_.extend(expectedOption1, {description: ''});
var validOption2 = createOptions(user1, 'activity', 'An activity');
var extraOptions1 = createOptions(user1, 'activity', 'An activity');
_.extend(extraOptions1, {'nancy': 'girl'});

var savedTicket;
var savedKey;
var savedMeta;

// var debugTicketCounter = function () {
//   createCounter++;
//   logger.debug('TEST:Ticket ' + createCounter + ' created');
// };

var failOnError = function (err, assert) {
  logger.error('TEST: Error ', err);
  console.log('TEST: Error ', err);
  assert.fail(err);
  assert.end();
};

test('models/ticket.js: TicketFactory returns ticket object with metadata', function (assert) {
  setTimeout(function () {
    assert.throws(Ticket.ticketFactory(), Error, 'No options should throw Error');
    assert.throws(Ticket.ticketFactory(createOptions()), Error, 'options with undefined values throw Error');
    assert.throws(Ticket.ticketFactory(createOptions('bob')), Error, 'Missing options throw Error');
    assert.throws(Ticket.ticketFactory(createOptions('bob', 'fred')), Error, 'Invalid type throws Error');
    assert.deepEqual((Ticket.ticketFactory(validOption1)).metadata, expectedOption1, 'description should be included as empty string if it was not present in options');
    assert.deepEqual((Ticket.ticketFactory(validOption2)).metadata, validOption2, 'valid options should succeed');
    assert.deepEqual((Ticket.ticketFactory(extraOptions1)).metadata, validOption2, 'extra options should be discarded');
    assert.end();
  }, 1000);
});

test('models/ticket.js: Creating a ticket updates ticket metadata', function (assert) {
  var ticket = Ticket.ticketFactory(validOption1);
  ticket.create()
  .then(function (reply) {
    assert.equal(ticket.metadata.num, 1, 'Counter is set');
    assert.ok(ticket.metadata.open, 'new ticket should have open status');
    assert.ok(ticket.metadata.createdTime, 'created time should not be null');
    assert.equal(ticket.metadata.modifiedTime, ticket.metadata.createdTime, 'Times should be equal');
    // Flush the db for the next test
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/ticket.js: Creating a ticket saves metadata at ticketKey', function (assert) {
  var ticket = Ticket.ticketFactory(validOption1);
  ticket.create()
  .then(function (reply) {
    assert.deepEqual(reply, ['OK', 1, 1, 1, 1], 'Saving ticket returns correct reply');
    return store.getMetadata(activityKey1);
  })
  .then(function (reply) {
    // Cast types of the reply so we can compare
    assert.deepEqual(Ticket._private.castMetadata(reply), ticket.metadata, 'Metadata is stored in database');
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/ticket.js: Creating a ticket saves ticket key in sets of keys', function (assert) {
  var ticket = Ticket.ticketFactory(validOption1);
  ticket.create()
  .then(function (reply) {
    return q.all([
      store.existsInSet(activityKey1, ticketSetKey),
      store.existsInSet(activityKey1, ownerSetKey1),
      store.existsInSet(activityKey1, openSetKey),
      store.existsInSet(activityKey1, typeSetKey1)
    ]);
  })
  .then(function (reply) {
    // Cast types of the reply so we can compare
    assert.deepEqual(reply, [true, true, true, true], 'Ticket key is stored in 4 sets');
    return q.all([
      store.listKeys(ticketSetKey),
      store.listKeys(ownerSetKey1),
      store.listKeys(openSetKey),
      store.listKeys(typeSetKey1)
    ]);
  })
  .then(function (reply) {
    assert.deepEqual(reply, [ [ 'dims:ticket:activity:1' ],
      [ 'dims:ticket:activity:1' ],
      [ 'dims:ticket:activity:1' ],
      [ 'dims:ticket:activity:1' ] ], 'Ticket key is only key in the 4 sets');
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/ticket.js: Creating a ticket should generate a counter for the ticket', function (assert) {
  var ticket = Ticket.ticketFactory(validOption1);
  var secondTicket;
  ticket.create()
  .then(function (reply) {
    assert.equal(ticket.metadata.num, 1, 'First ticket has counter of 1');
    secondTicket = Ticket.ticketFactory(validOption1);
    return secondTicket.create();
  })
  .then(function (reply) {
    assert.equal(secondTicket.metadata.num, 2, 'Ticket counter is incremented');
    return store.listKeys(ticketSetKey);
  })
  .then(function (reply) {
    assert.deepEqual(reply, ['dims:ticket:activity:1', 'dims:ticket:activity:2'], 'Unique keys generated using counter');
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/ticket.js: Exists reports presence of ticket key in set of keys', function (assert) {
  var ticket = Ticket.ticketFactory(validOption1);
  ticket.create()
  .then(function (reply) {
    return ticket.exists();
  })
  .then(function (reply) {
    assert.ok(reply, 'Ticket exists reports true');
    ticket.metadata.num = 5; // change key to invalid
    return ticket.exists();
  })
  .then(function (reply) {
    assert.notOk(reply, 'Ticket does not exist reports false');
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });

});


test('models/ticket.js: Closing a ticket should update it in database', function (assert) {
  var ticket = Ticket.ticketFactory(validOption1);
  ticket.create()
  .then(function (reply) {
    assert.equal(ticket.metadata.open, true, 'created ticket is initially open');
    return ticket.close();
  })
  .then(function (reply) {
    assert.equal(ticket.metadata.open, false, 'ticket object says it is closed');
    return store.getMetadata(activityKey1);
  })
  .then(function (reply) {
    // Cast types of the reply so we can compare
    reply = Ticket._private.castMetadata(reply);
    assert.equal(reply.open, false, 'metadata in database says ticket is closed');
    assert.notEqual(reply.modifiedTime, reply.createdTime, 'modifiedTime was updated');
    assert.equal(reply.modifiedTime, ticket.metadata.modifiedTime, 'modifiedTime in object was updated');
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/ticket.js: Trying to close a ticket that does not exist returns Error', function (assert) {
  var ticket = Ticket.ticketFactory(validOption1);
  assert.throws(ticket.close());
  client.flushdbAsync()
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/ticket.js: Opening a ticket should update it in database', function (assert) {
  var ticket = Ticket.ticketFactory(validOption1);
  var closedModTime;
  ticket.create()
  .then(function (reply) {
    assert.equal(ticket.metadata.open, true, 'created ticket is initially open');
    return ticket.close();
  })
  .then(function (reply) {
    assert.equal(ticket.metadata.open, false, 'after closing, ticket object says it is closed');
    return store.getMetadata(activityKey1);
  })
  .then(function (reply) {
    // Cast types of the reply so we can compare
    reply = Ticket._private.castMetadata(reply);
    assert.equal(reply.open, false, 'metadata in database says ticket is closed');
    closedModTime = reply.modifiedTime;
    return ticket.open();
  })
  .then(function (reply) {
    assert.equal(ticket.metadata.open, true, 'ticket object now says it is open');
    assert.notEqual(ticket.metadata.modifiedTime, closedModTime, 'modifiedTime was updated in object');
    return store.getMetadata(activityKey1);
  })
  .then(function (reply) {
    // Cast types of the reply so we can compare
    reply = Ticket._private.castMetadata(reply);
    assert.equal(reply.open, true, 'metadata in database says ticket is open');
    assert.equal(reply.modifiedTime, ticket.metadata.modifiedTime, 'modifiedTime in database was updated');
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/ticket.js: Trying to open a ticket that does not exist returns Error', function (assert) {
  var ticket = Ticket.ticketFactory(validOption1);
  assert.throws(ticket.open());
  client.flushdbAsync()
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/ticket.js: getTicket returns ticket object for retrieved ticket', function (assert) {
  var ticket = Ticket.ticketFactory(validOption1);
  ticket.create()
  .then(function (reply) {
    return Ticket.getTicket(activityKey1);
  })
  .then(function (reply) {
    assert.deepEqual(reply, ticket, 'retrieved ticket matches');
    return Ticket.getTicket('bob');
  })
  .then(function (reply) {
    assert.equal(reply, null, 'getTicket returns null if ticket does not exist');
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});



// test('models/ticket.js: getAllTicket keys', function (assert) {
//   // Will report number of ticket keys we have saved so far
//   Ticket.getAllTicketKeys()
//   .then(function (reply) {
//     assert.equal(reply.length, 4, 'Array should have 4 keys');
//     assert.end();
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
// });

// test('models/ticket.js: getTicket should return populated ticket object', function (assert) {
//   // Create the initial ticket
//   var newTicket = Ticket.ticketFactory();
//   var ticketMeta;
//   newTicket.create(ticketType1, user)

//   .then(function (meta) {
//     debugTicketCounter(meta);
//     var ticketKey = keyGen.ticketKey(meta);
//     ticketMeta = meta;
//     //Now retrieve a ticket object via getTicket static method
//     return Ticket.getTicket(ticketKey);
//   })
//   .then(function (reply) {
//     // reply is the new ticket object
//     assert.deepEqual(reply, newTicket, 'Retrieved ticket object equals original object');
//     assert.end();
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
// });


// test('models/ticket.js: addTopic should return topic object with correct metadata', function (assert) {
//   var newTicket = Ticket.ticketFactory();
//   newTicket.create(ticketType1, user)
//   .then(function (meta) {
//     debugTicketCounter(meta);
//     return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
//   })
//   .then(function (reply) {
//     assert.equal(typeof reply, 'object', 'Reply is an object');
//     assert.equal(typeof (reply.save), 'function', 'Reply has save method');
//     assert.equal(typeof (reply.setDataType), 'function', 'Reply has setDataType method');
//     assert.equal(typeof (reply.getDataType), 'function', 'Reply has getDataType method');
//     assert.equal(reply.parent.creator, user, 'Reply has correct parent.creator');
//     assert.equal(reply.parent.type, ticketType1, 'Reply has correct parent.type');
//     assert.equal(reply.parent.num, createCounter, 'Reply has correct parent counter');
//     // Type of topic is same as parent
//     assert.equal(reply.type, ticketType1, 'Reply topic type is the same as parent');
//     assert.equal(reply.name, topicName1, 'Reply has correct topic name');
//     assert.equal(reply.dataType, topicDataType1, 'Reply has correct topic dataType');
//     assert.end();
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
// });

// test('models/ticket.js: addTopic should return error if topic already exists', function (assert) {
//   var newTicket = Ticket.ticketFactory();
//   newTicket.create(ticketType1, user)
//   .then(function (meta) {
//     debugTicketCounter(meta);
//     return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
//   })
//   .then(function (reply) {
//     return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
//   })
//   .then(function (reply) {
//     assert.ok(reply instanceof Error, 'Add topic that already exists should return an error');
//     assert.end();
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
// });

// test('models/ticket.js: addTopic should save the contents to the database correctly when dataType is hash', function (assert) {
//   var newTicket = Ticket.ticketFactory();
//   newTicket.create(ticketType1, user)
//   .then(function (meta) {
//     debugTicketCounter(meta);
//     return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
//   })
//   .then(function (reply) {
//     // Topic key
//     var key = keyGen.topicKey(reply);
//     // Get value at key (hash)
//     return db.hgetallProxy(key);
//   })
//   .then(function (reply) {
//     assert.deepEqual(reply, topicContents1, 'Contents were saved correctly for hash');
//     assert.end();
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
// });

// test('models/ticket.js: addTopic should save the contents to the database correctly when dataType is string', function (assert) {
//   var newTicket = Ticket.ticketFactory();
//   newTicket.create(ticketType1, user)
//   .then(function (meta) {
//     debugTicketCounter(meta);
//     return newTicket.addTopic(topicName2, topicDataType2, topicContents2);
//   })
//   .then(function (reply) {
//     // Topic key
//     var key = keyGen.topicKey(reply);
//     // Get value at key (string)
//     return db.getProxy(key);
//   })
//   .then(function (reply) {
//     assert.equal(reply, topicContents2, 'Contents were saved correctly for string');
//     assert.end();
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
// });


// test('models/ticket.js: addTopic should save the topic key to the set of topics for this ticket', function (assert) {
//   var newTicket = Ticket.ticketFactory();
//   newTicket.create(ticketType1, user)
//   .then(function (meta) {
//     debugTicketCounter(meta);
//     return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
//   })
//     .then(function (reply) {
//     // reply is topic object
//     // setKey is key to set of Topics for this ticket
//     var setKey = keyGen.topicSetKey(newTicket);
//     // Key to this topic
//     var topicKey = keyGen.topicKey(reply);
//     // Rank should be greater than or equal to 0.
//     assert.ok(client.zrank(setKey, topicKey) >= 0, 'Set of topics for the ticket contains the topic key');
//     assert.end();
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
// });


// test('models/ticket.js: Topic.setDatatype should set the dataType of the topic object', function (assert) {
//   var newTicket = Ticket.ticketFactory();
//   newTicket.create(ticketType1, user).then(function (meta) {
//     debugTicketCounter(meta);
//     return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
//   })
//   .then(function (reply) {
//     assert.equal(reply.dataType, topicDataType1, 'Original dataType is correct (from parent)');
//     reply.setDataType(topicDataType2);
//     assert.equal(reply.dataType, topicDataType2, 'DataType was modified');
//     assert.end();
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
// });

// test('models/ticket.js: Topic.getDataType should get the dataType from the database', function (assert) {
//   var newTicket = Ticket.ticketFactory();
//   newTicket.create(ticketType1, user).then(function (meta) {
//     debugTicketCounter(meta);
//     return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
//   })
//   .then(function (reply) {
//     assert.equal(reply.dataType, topicDataType1, 'Original datatype as created');
//     return reply.getDataType();
//   })
//   .then(function (result) {
//     assert.equal(result, topicDataType1, 'getDataType returns the topic dataType');
//     assert.end();
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
// });

// test('models/ticket.js: Topic.getTopicMetadata should should return metadata from object', function (assert) {
//   var newTicket = Ticket.ticketFactory();
//   newTicket.create(ticketType1, user).then(function (meta) {
//     debugTicketCounter(meta);
//     return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
//   })
//   .then(function (reply) {
//     var result = reply.getTopicMetadata();
//     var expected = {
//       parent: reply.parent,
//       type: reply.type,
//       name: reply.name,
//       dataType: reply.dataType
//     };
//     assert.deepEqual(result, expected, 'getTopicMetadata returns metadata from object');
//     assert.end();
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
// });

// test('models/ticket.js: Topic.getContents should should return contents from database', function (assert) {
//   var newTicket = Ticket.ticketFactory();
//   var topicKey;
//   newTicket.create(ticketType1, user).then(function (meta) {
//     debugTicketCounter(meta);
//     return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
//   })
//   .then(function (reply) {
//     topicKey = keyGen.topicKey(reply);
//     return reply.getContents();
//   })
//   .then(function (reply) {
//     return db.hgetallProxy(topicKey);
//   })
//   .then(function (reply) {
//     assert.deepEqual(reply, topicContents1, 'Contents retrieved from database');
//     assert.end();
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
// });

// test('models/ticket.js: Topic.exists should report the existence of the topic', function (assert) {
//   var newTicket = Ticket.ticketFactory();
//   newTicket.create(ticketType1, user).then(function (meta) {
//     debugTicketCounter(meta);
//     return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
//   })
//   .then(function (reply) {
//     return reply.exists();
//   })
//   .then(function (result) {
//     assert.ok(result, 'Existing topic reported as true');
//     // Create a new topic for this ticket
//     var newTopic = Ticket.topicFactory({
//       parent: newTicket,
//       type: newTicket.type,
//       name: 'bob',
//       dataType: 'string'
//     });
//     return newTopic.exists();
//   })
//   .then(function (result) {
//     assert.notOk(result, 'Nonexisting topic reported as false');
//     assert.end();
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
// });

// test('models/ticket.js: Ticket.getTopicKeys should return the correct keys', function (assert) {
//   var newTicket = Ticket.ticketFactory();
//   var topicKey1,
//       topicKey2;
//   newTicket.create(ticketType1, user).then(function (meta) {
//     debugTicketCounter(meta);
//     return newTicket.addTopic(topicName2, topicDataType2, topicContents2);
//   })
//   .then(function (reply) {
//     // Save key to this topic
//     topicKey1 = keyGen.topicKey(reply);
//     return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
//   })
//   .then(function (reply) {
//     // Save key to second topic
//     topicKey2 = keyGen.topicKey(reply);
//     return newTicket.getTopicKeys();
//   })
//   .then(function (reply) {
//     assert.ok(_.indexOf(reply, topicKey1) > -1, 'Result contains first key');
//     assert.ok(_.indexOf(reply, topicKey2) > -1, 'Result contains second key');
//     assert.equal(reply.length, 2, 'Result only contains 2 keys');
//     assert.end();
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
// });

// test('models/ticket.js: Ticket.topicFromKey creates topic object from key', function (assert) {
//   var newTicket = Ticket.ticketFactory();
//   var firstTopic;
//   newTicket.create(ticketType1, user).then(function (meta) {
//     debugTicketCounter(meta);
//     return newTicket.addTopic(topicName2 + '2', topicDataType2, topicContents2);
//   })
//   .then(function (reply) {
//     // Save topic
//     firstTopic = reply;
//     // Get the key
//     var topicKey = keyGen.topicKey(reply);
//     return newTicket.topicFromKey(topicKey);
//   })
//   .then(function (reply) {
//     // reply should equal firstTopic
//     assert.deepEqual(reply, firstTopic, 'Topic created from key');
//     assert.end();
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
// });

// test('models/ticket.js: Ticket.getTopics should return array of Topic objects', function (assert) {
//   var newTicket = Ticket.ticketFactory();
//   var topicKey1, topic1,
//       topicKey2, topic2;
//   newTicket.create(ticketType1, user).then(function (meta) {
//     debugTicketCounter(meta);
//     return newTicket.addTopic(topicName2, topicDataType2, topicContents2);
//   })
//   .then(function (reply) {
//     // Save the topic
//     topic1 = reply;
//     return newTicket.addTopic(topicName1, topicDataType1, topicContents1);
//   })
//   .then(function (reply) {
//     // Save second topic
//     topic2 = reply;
//     // Get the topics
//     return newTicket.getTopics();
//   })
//   .then(function (reply) {
//     assert.equal(reply.length, 2, 'Result only contains 2 topics');
//     // Set is sorted by time, so these should be in time order
//     assert.deepEqual(reply[0], topic1, 'First topic key in array');
//     assert.deepEqual(reply[1], topic2, 'Second topic key in array');
//     assert.end();
//   })
//   .catch(function (err) {
//     console.error(err);
//   });
// });

// test('models/ticket.js: Finished', function (assert) {
//   client.flushdb(function (reply) {
//     client.quit(function (err, reply) {
//       assert.end();
//     });
//   });
// });
test('models/store.js: Finished', function (assert) {
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
