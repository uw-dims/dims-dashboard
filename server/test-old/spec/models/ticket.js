'use strict'

//var redisDB = require('../../../utils/redisDB');
// var redisDB = require('../config');
//var redis = require('redis');
var logger = require('../../../utils/logger')(module);
var KeyGen = require('../../../models/keyGen');
var c = require('../../../config/redisScheme');
var q = require('q');

// Redis mock
var redis = require('redis-js');
var client = redis.createClient();
var db = require('../../../utils/redisUtils')(client);

var ticketFactory = require('../../../models/ticket')(db);


// Bootstrap some data
var user = 'testUser'; // Simulates logged in user

var topicName1 = 'topicHashData',
    topicDataType1 = 'hash',
    topicContents1 = {
      'field1':'value1',
      'field2':'value2'
    },
    topicName2 = 'topicStringData',
    topicDataType2 = 'string',
    // Set to one value until jenkins redis is updated from 2.2.10
    topicContents2 = 'aaaaaa',
    ticketType1 = 'data';

var createCounter;

// Perform first before first test starts
before(function(done) {
  // Get the redis db
  logger.debug('TEST: Performing before functions');
  // redis.debug_mode = false;
  createCounter = 0;
  done();
});

// Perform after all tests done
after(function(done) {
  logger.debug('Quitting redis');

  client.flushdb(function(reply) {
    logger.debug('flushdb reply ',reply);
    client.quit(function(err, reply) {
      logger.debug('quit reply ',reply);
      done();
    });
  });
});

var debugTicketCounter = function(ticket) {
  createCounter++;
  //logger.debug('TEST:Ticket '+ createCounter +' created: ', ticket.paramString());
  console.log('TEST:Ticket '+ createCounter +' created: ' + ticket.paramString())
};

var failOnError = function(err) {
  logger.debug('TEST: Error ', err);
  expect('Error').to.equal('Success');
};

describe('models/Ticket', function() {

  describe('#create', function(done) {
    it('should have a creator', function(done) {
      var newTicket = ticketFactory();
      newTicket.create(ticketType1, user).then(function(ticket) {
        debugTicketCounter(ticket);
        expect(ticket.creator).to.equal(user);
        done();
      }, function(err) {
        failOnError(err.toString());
      }).done();
    });

    // Need to fix this
    // it('should fail if creator not supplied', function(done) {
    //   var ticket = new Ticket();
    //   ticket.create().then(function(ticket) {
    //     debugTicketCounter(ticket);
    //     expect(ticket.creator).to.equal('');
    //     done();
    //   }, function(err) {
    //     failOnError(err.toString());
    //   }).done();
    // });

    it('should have a type', function(done) {
      var newTicket = ticketFactory();
      newTicket.create(ticketType1, user).then(function(ticket) {
        debugTicketCounter(ticket);
        expect(ticket.type).to.equal(ticketType1);
        done();
      }, function(err) {
        failOnError(err.toString());
      }).done();
    });

    // Need to fix this
    // it('should fail if type not supplied', function(done) {
    //   var ticket = new Ticket();
    //   ticket.create().then(function(ticket) {
    //     debugTicketCounter(ticket);
    //     expect(ticket.type).to.equal('');
    //     done();
    //   }, function(err) {
    //     failOnError(err.toString());
    //   }).done();
    // });

    it('should generate a counter for the ticket', function(done) {
      var newTicket = ticketFactory();
      var createdKey;
      newTicket.create(ticketType1, user).then(function(ticket) {
        debugTicketCounter(ticket);
        // get the counter
        createdKey = ticket.num;
        // lookup the key
        var key = KeyGen.ticketCounterKey();
        // Get the generated counter
        return db.get(key);
      })
      .then(function(reply) {
        console.log(reply);
        console.log(createdKey);
          var num = parseInt(reply);
          expect(num).to.equal(createdKey);
          done();
      }, function(err) {
        failOnError(err.toString());
      }).done();
    });

    it('should save the ticket key in the tickets set', function(done) {
      var newTicket = ticketFactory();
      newTicket.create(ticketType1, user).then(function(ticket) {
        debugTicketCounter(ticket);
        // Key to set of tickets
        var setKey = KeyGen.ticketSetKey();
        // Key to this ticket
        var ticketKey = KeyGen.ticketKey(ticket);
        // This ticket should be in the tickets set
        db.zrank(setKey,ticketKey).then(function(reply) {
          expect(reply).not.to.equal(null);
          done();
        }, function(err) {
          failOnError(err.toString());
        }).done();
      });
    });

    it('should set the ticket value correctly', function(done) {
      var newTicket = ticketFactory();
      newTicket.create(ticketType1, user).then(function(ticket) {
        debugTicketCounter(ticket);
        // Key to this ticket
        var ticketKey = KeyGen.ticketKey(ticket);
        // Get the value pointed to by the key
        db.hgetall(ticketKey).then(function(reply){
          expect(reply.type).to.equal(ticketType1);
          expect(reply.creator).to.equal(user);
          done();
        }, function(err) {
          failOnError(err.toString());
        }).done();
      });
    });
  });

  describe('#getTicket', function(done) {

    it('should return the stored ticket data', function(done) {
      var newTicket = ticketFactory();
      newTicket.create(ticketType1, user).then(function(ticket) {
        debugTicketCounter(ticket);
        var key = KeyGen.ticketKey(ticket);
        //var lookedupTicket = new Ticket();
        ticket.getTicket(key).then(function(ticket2) {
          expect(ticket2.creator).to.equal(user);
          expect(ticket2.type).to.equal(ticketType1);
          done();
        });
      });
    });
    it('should return update the calling object', function(done) {
      var newTicket =  ticketFactory();
      newTicket.create(ticketType1, user).then(function(ticket) {
        debugTicketCounter(ticket);
        var key = KeyGen.ticketKey(ticket);
        // Get a new ticket object
        var lookedupTicket = ticketFactory();
        // Retrieve data for this new ticket from the original key
        lookedupTicket.getTicket(key).then(function(reply) {
          expect(lookedupTicket.creator).to.equal(user);
          expect(lookedupTicket.type).to.equal(ticketType1);
          done();
        });
      });
    });
  });

  describe('#getAllTickets', function(done) {
    it('should return all ticket keys', function(done) {
      var newTicket = ticketFactory();
      newTicket.getAllTickets().then(function(reply) {
        console.log(reply);
        expect(reply).not.to.be.empty;
        done();
      });
    });
  });

  // describe('#addTopic', function(done) {
  //   it('should return a topic object when the content', function(done) {
  //     //var ticket = new Ticket();
  //     Ticket.create(ticketType1, user).then(function(ticket) {
  //       debugTicketCounter(ticket);
  //       ticket.addTopic(topicName1, topicDataType1, topicContents1)
  //         .then(function(reply) {
  //           expect(reply.parent.creator).to.equal(user);
  //           expect(reply.parent.type).to.equal(ticketType1);
  //           expect(reply.parent.num).to.equal(createCounter);
  //           expect(reply.type).to.equal(ticketType1);
  //           expect(reply.name).to.equal(topicName1);
  //           expect(reply.dataType).to.equal(topicDataType1);
  //           done();
  //         });
  //     });
  //   });

  //   it('should save the content to the database correctly when dataType is hash', function(done) {
  //     //var ticket = new Ticket();
  //     Ticket.create(ticketType1, user).then(function(ticket) {
  //       debugTicketCounter(ticket);
  //       ticket.addTopic(topicName1, topicDataType1, topicContents1)
  //         .then(function(reply) {
  //           var key = KeyGen.topicKey(reply);
  //           db.hgetall(key).then(function(reply) {
  //             expect(reply).to.eql(topicContents1);
  //             done();
  //           }, function(err, reply) {
  //             failOnError(err.toString());
  //           }).done();
  //         });
  //     });
  //   });

  //   it('should save the content to the database correctly when dataType is string', function(done) {
  //     //var ticket = new Ticket();
  //     Ticket.create(ticketType1, user).then(function(ticket) {
  //       debugTicketCounter(ticket);
  //       ticket.addTopic(topicName2, topicDataType2, topicContents2)
  //         .then(function(reply) {
  //           var key = KeyGen.topicKey(reply);
  //           db.get(key).then(function(reply) {
  //             expect(reply).to.equal(topicContents2);
  //             done();
  //           }, function(err, reply) {
  //             failOnError(err.toString());
  //           }).done();
  //         });
  //     });
  //   });

  //   it('should save the topic key to the set of topics', function(done) {
  //     //var ticket = new Ticket();
  //     Ticket.create(ticketType1, user).then(function(ticket) {
  //       debugTicketCounter(ticket);
  //       ticket.addTopic(topicName1, topicDataType1, topicContents1)
  //         .then(function(reply) {
  //           db.zrank(KeyGen.topicListKey(ticket), KeyGen.topicKey(reply)).then(function(reply) {
  //             expect(reply).not.to.equal(null);
  //             done();
  //           }, function(err, reply) {
  //             failOnError(err.toString());
  //           }).done();
  //         });
  //     });
  //   });
  // });


  // describe('#getTopicKeys', function(done) {

  //   it('should retrieve all topic keys from a ticket', function(done) {
  //     //var ticket = new Ticket();
  //     Ticket.create(ticketType1, user).then(function(ticket) {
  //       debugTicketCounter(ticket);
  //       ticket.addTopic(topicName1, topicDataType1, topicContents1).then(function(topic1) {
  //         // Get the topics
  //         ticket.getTopicKeys().then(function(keys) {
  //           expect(keys).not.to.be.empty;
  //           expect(keys).to.be.instanceof(Array);
  //           expect(keys).to.have.length(1);
  //           // Add another topic
  //           ticket.addTopic(topicName2, topicDataType2, topicContents2).then(function(topic2) {
  //             ticket.getTopicKeys().then(function(keys) {
  //               expect(keys).not.to.be.empty;
  //               expect(keys).to.be.instanceof(Array);
  //               expect(keys).to.have.length(2);
  //               done();
  //             });
  //           });
  //         });
  //       });
  //     });
  //   });
  // });

  // describe('#topicFromKey', function(done) {

  //   it('should return the topic object ', function(done) {
  //     //var ticket = new Ticket();
  //     var expectedTopic = {};
  //     ticket.create(ticketType1, user).then(function(ticket) {
  //       debugTicketCounter(ticket);
  //       ticket.addTopic(topicName1, topicDataType1, topicContents1).then(function(topic) {
  //         expectedTopic = topic;
  //         // Get the topic key
  //         var key = KeyGen.topicKey(topic);
  //         ticket.topicFromKey(key).then(function(reply) {
  //           expect(reply).to.eql(expectedTopic);
  //           done();
  //         });
  //       });
  //     });

  //   });
  // });

  // describe('#getTopics', function(done) {
  //   it('should retrieve all topics from a ticket', function(done) {
  //     //var ticket = new Ticket();
  //     ticket.create(ticketType1, user).then(function(ticket) {
  //       debugTicketCounter(ticket);
  //       ticket.addTopic(topicName1, topicDataType1, topicContents1).then(function(topic1) {
  //         // Add another topic
  //           ticket.addTopic(topicName2, topicDataType2, topicContents2).then(function(topic2) {
  //             ticket.getTopics().then(function(topics) {
  //               expect(topics).not.to.be.empty;
  //               expect(topics).to.be.instanceof(Array);
  //               expect(topics).to.have.length(2);
  //               expect(topics[0]).to.eql(topic1);
  //               expect(topics[1]).to.eql(topic2);
  //               done();
  //             });
  //           });
  //       });
  //     });
  //   });
  //});

});


// EOF
