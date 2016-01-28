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

var store = require('../../../models/store')(client);
var Ticket = require('../../../models/ticket')(store);

// Bootstrap some data
var user = 'testUser'; // Simulates logged in user

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

var user1 = 'testuser';
var tg1 = 'dims1';
var tg2 = 'dims2';
var activityKey1 = 'dims:ticket:activity:1';
var mitigationKey1 = 'dims:ticket:activity:1';
var userKey1 = 'dims:ticket:' + user1 + ':1';
var ownerSetKey1 = 'dims:ticket.__owner.__' + user1;
var openSetKey = 'dims:ticket.__open';
var typeSetKey1 = 'dims:ticket.__type.__activity';
var ticketSetKey = 'dims:ticket.__keys';
var tg1Key = 'dims:ticket.__tg.__' + tg1;
var tg2Key = 'dims:ticket.__tg.__' + tg2;

var validOption1 = createOptions(user1, 'activity', 'Activity 1', tg1, false);
var expectedOption1 = createOptions(user1, 'activity', 'Activity 1', tg1, false);
_.extend(expectedOption1, {description: ''});
var validOption2 = createOptions(user1, 'activity', 'Activity 2', tg1);
var expectedOption2 = createOptions(user1, 'activity', 'Activity 2', tg1, false, '');
var extraOptions1 = createOptions(user1, 'activity', 'Activity3', tg1, true, 'An activity');
_.extend(extraOptions1, {'nancy': 'girl'});
var expectedOption3 = createOptions(user1, 'activity', 'Activity3', tg1, true, 'An activity');

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
    assert.throws(Ticket.ticketFactory(createOptions('bob', 'activity')), Error, 'Missing name throws Error');
    assert.deepEqual((Ticket.ticketFactory(validOption1)).metadata, expectedOption1, 'description should be included as empty string if it was not present in options');
    assert.deepEqual((Ticket.ticketFactory(validOption2)).metadata, expectedOption2, 'valid options should succeed');
    assert.deepEqual((Ticket.ticketFactory(extraOptions1)).metadata, expectedOption3, 'extra options should be discarded');
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
    assert.deepEqual(reply,
      { key: keyGen.ticketKey(ticket.metadata),
        metadata: ticket.metadata}, 'Saving ticket returns correct reply');
    return store.getMetadata(activityKey1);
  })
  .then(function (reply) {
    // Cast types of the reply so we can compare
    console.log(reply);
    assert.deepEqual(Ticket._private.castMetadata(reply), ticket.metadata, 'Metadata is stored in database');
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/ticket.js: Creating a ticket saves ticket key in sets of keys', function (assert) {
  var ticket = Ticket.ticketFactory(validOption1);
  ticket.create()
  .then(function () {
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
      store.listItems(ticketSetKey),
      store.listItems(ownerSetKey1),
      store.listItems(openSetKey),
      store.listItems(typeSetKey1)
    ]);
  })
  .then(function (reply) {
    assert.deepEqual(reply, [ [ 'dims:ticket:activity:1' ],
      [ 'dims:ticket:activity:1' ],
      [ 'dims:ticket:activity:1' ],
      [ 'dims:ticket:activity:1' ] ], 'Ticket key is only key in the 4 sets');
    return client.flushdbAsync();
  })
  .then(function () {
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
    return store.listItems(ticketSetKey);
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
  return ticket.close()
  .catch(function (err) {
    assert.ok(err instanceof Error, 'Error was thrown');
    client.flushdbAsync()
    .then(function (reply) {
      assert.end();
    });
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
  return ticket.open()
  .catch(function (err) {
    assert.ok(err instanceof Error, 'Error was thrown');
    client.flushdbAsync()
    .then(function (reply) {
      assert.end();
    });
  });
});

test('models/ticket.js: getTicket returns ticket object for retrieved ticket', function (assert) {
  var ticket = Ticket.ticketFactory(validOption1);
  ticket.create()
  .then(function (reply) {
    return Ticket.getTicket(activityKey1);
  })
  .then(function (reply) {
    console.log(reply.metadata);
    console.log(ticket.metadata);
    assert.deepEqual(reply.metadata, ticket.metadata, 'retrieved ticket matches');
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

// This needs to be rewritten as validateQuery now requires a callback
test.skip('models/ticket.js: validateQuery validates query options', function (assert) {
  var options = {
    type: 'all'
  };
  assert.deepEqual(Ticket._private.validateQuery(options), options, 'options with only type: all validates');
  options = {
    bob: 'all'
  };
  assert.equal(Ticket._private.validateQuery(options), null, 'options without type fails validataion');
  options = {
    type: 'mitigation'
  };
  assert.deepEqual(Ticket._private.validateQuery(options), options, 'options with only type: mitigation validate');
  options = {
    type: 'activity'
  };
  assert.deepEqual(Ticket._private.validateQuery(options), options, 'options with only type: activity validate');
  options = {
    type: 'bob'
  };
  assert.equal(Ticket._private.validateQuery(options), null, 'invalid type does not validate');
  options = {
    type: 'all',
    ownedBy: user1
  };
  assert.deepEqual(Ticket._private.validateQuery(options), options, 'options validate with type, owned by');
  options = {
    type: 'all',
    ownedBy: user1,
    private: true
  };
  assert.deepEqual(Ticket._private.validateQuery(options), options, 'options validate: all, ownedBy, true');
  options = {
    type: 'all',
    private: true
  };
  assert.equal(Ticket._private.validateQuery(options), null, 'missing ownedBy does not validate');
  options = {
    type: 'all',
    open: 'bridge'
  };
  assert.equal(Ticket._private.validateQuery(options), null, 'invalid value for open does not validate');
  options = {
    type: 'all',
    ownedBy: user1,
    private: 'bridge'
  };
  assert.equal(Ticket._private.validateQuery(options), null, 'invalid value for private does not validate');
  options = {
    type: 'all',
    open: true
  };
  assert.deepEqual(Ticket._private.validateQuery(options), options, 'options validate');
  options = {
    type: 'all',
    open: false
  };
  assert.deepEqual(Ticket._private.validateQuery(options), options, 'options validate');
  options = {
    type: 'all',
    ownedBy: user1,
    open: true,
    bob: true
  };
  var expectedOptions = {
    type: 'all',
    ownedBy: user1,
    open: true
  };
  assert.deepEqual(Ticket._private.validateQuery(options), expectedOptions, 'extra options are discarded');
  assert.end();
});

test('models/ticket.js: getTicketKeys returns array of keys', function (assert) {
  createTickets()
  .then(function (reply) {
    console.log(reply);
    return client.keysAsync('*ticket*');
  })
  .then(function (reply) {
    console.log(reply);
    return client.zrangeAsync('dims:ticket.__type.__activity', 0, -1);
  })
  .then(function (reply) {
    console.log(reply);
    return client.zrangeAsync('dims:ticket.__public', 0, -1);
  })
  .then(function (reply) {
    console.log(reply);
    return client.zrangeAsync('dims:ticket.__open', 0, -1);
  })
  .then(function (reply) {
    console.log(reply);

    return client.zrangeAsync('dims:ticket.__owner.__testuser1', 0, -1);
  })
  .then(function (reply) {
    console.log(reply);
 
    // These need to be rewritten or discarded. 'all' is no longer a valid type

  //   return Ticket._private.getTicketKeys({
  //     type: 'all'
  //   });
  // })
  // .then(function (reply) {
  //   // console.log('test ', reply);
  //   assert.equals(reply.length, 4);
  //   return Ticket._private.getTicketKeys({
  //     type: 'all',
  //     ownedBy: 'testuser1'
  //   });
  // })
  // .then(function (reply) {
  //   // console.log('test ', reply);
  //   assert.equals(reply.length, 1);
  //   return Ticket._private.getTicketKeys({
  //     type: 'all',
  //     ownedBy: 'testuser1',
  //     open: false
  //   });
  // })
  // .then(function (reply) {
  //   // console.log('test ', reply);
  //   assert.equals(reply.length, 0);
  //   return Ticket._private.getTicketKeys({
  //     type: 'all',
  //     open: true
  //   });
  // })
  // .then(function (reply) {
  //   // console.log('test ', reply);
  //   assert.equals(reply.length, 3);
  //   return Ticket._private.getTicketKeys({
  //     type: 'all',
  //     open: true,
  //     private: true,
  //     ownedBy: 'testuser2'
  //   });
  // })
  // .then(function (reply) {
  //   // console.log('test ', reply);
  //   assert.equals(reply.length, 1);
    return Ticket._private.getTicketKeys({
      type: 'activity',
      open: true,
      private: false,
      ownedBy: 'testuser1'
    });
  })
  .then(function (reply) {
    // console.log('test ', reply);
    assert.equals(reply.length, 1);
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/ticket.js: getTickets returns array of ticket objects', function (assert) {
  createTickets()
  .then(function (reply) {
    // These need to be rewritten. 'all' is no longer a valid type
  //   return Ticket.getTickets({
  //     type: 'all'
  //   });
  // })
  // .then(function (reply) {
  //   console.log(reply);
  //   assert.equals(reply.length, 4);
  //   assert.ok(reply[0].hasOwnProperty('metadata'));
  //   return Ticket.getTickets({
  //     type: 'all',
  //     ownedBy: 'testuser1'
  //   });
  // })
  // .then(function (reply) {
  //   console.log(reply);
  //   assert.equals(reply.length, 1);
  //   return Ticket.getTickets({
  //     type: 'all',
  //     ownedBy: 'testuser1',
  //     open: false
  //   });
  // })
  // .then(function (reply) {
  //   // console.log('test ', reply);
  //   assert.equals(reply.length, 0);
  //   return Ticket.getTickets({
  //     type: 'all',
  //     open: true
  //   });
  // })
  // .then(function (reply) {
  //   // console.log('test ', reply);
  //   assert.equals(reply.length, 3);
  //   return Ticket.getTickets({
  //     type: 'all',
  //     open: true,
  //     private: true,
  //     ownedBy: 'testuser2'
  //   });
  // })
  // .then(function (reply) {
  //   // console.log('test ', reply);
  //   assert.equals(reply.length, 1);
    return Ticket.getTickets({
      type: 'activity',
      open: true,
      private: false,
      ownedBy: 'testuser1'
    });
  })
  .then(function (reply) {
    console.log('test ', reply);
    assert.equals(reply.length, 1);
    return client.flushdbAsync();
  })
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/ticket.js: Finished', function (assert) {
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
