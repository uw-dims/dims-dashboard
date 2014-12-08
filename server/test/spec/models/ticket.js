'use strict'

var Ticket = require('../../../models/ticket');
var db = require('../../../utils/redisUtils');
var redisDB = require('../../../utils/redisDB');
var redis = require('redis');
var logger = require('../../../utils/logger');
var KeyGen = require('../../../models/keyGen');
var c = require('../../../config/redisScheme');
var q = require('q');

// Bootstrap some data
var user = 'testUser'; // Simulates logged in user

var topicName1 = 'topicHashData',
    topicDataType1 = 'hash',
    topicContents1 = {
      'field1':'value1',
      'field2':'value2'
    },
    topicName2 = 'topicSetData',
    topicDataType2 = 'set',
    topicContents2 = [ 'aaaaa', 'bbbbb'];

var createCounter;

// Perform first before first test starts
before(function() {
  // Get the redis db
  redisDB.select(4, function(err, reply) {
    logger.debug('TEST: redis select reply', reply);
  });
  redis.debug_mode = false;
  redisDB.on('error', function(err) {
    logger.error('Received error event: ', err);
  });
  createCounter = 0;
});

// Perform after all tests done
after(function(done) {
  logger.debug('Quitting redis');
  redisDB.flushdb(function(reply) {
    logger.debug('flushdb reply ',reply);
    redisDB.quit(function(err, reply) {
      logger.debug('quit reply ',reply);
      done();
    });
  });
});

var debugTicketCounter = function(ticket) {
  createCounter++;
  logger.debug('TEST:Ticket '+ createCounter +' created: ', ticket.paramString());  
};

var failOnError = function(err) {
  logger.debug('TEST: Error ', err);
  expect('Error').to.equal('Success');
};

describe('models/Ticket', function() {

  // Test the create method
  describe('#create', function(done) {
    it('should have a creator if one is supplied', function(done) {
      var ticket = new Ticket();
      ticket.create({creator: user}).then(function(ticket) {
        debugTicketCounter(ticket);
        expect(ticket.creator).to.equal('testUser');
        done();
      }, function(err) {
        failOnError(err.toString());
      }).done();
    });

    it('should have a blank creator if one is not supplied', function(done) {
      var ticket = new Ticket();
      ticket.create().then(function(ticket) {
        debugTicketCounter(ticket);
        expect(ticket.creator).to.equal('');
        done();
      }, function(err) {
        failOnError(err.toString());
      }).done();
    });

    it('should have a type if one is supplied', function(done) {
      var ticket = new Ticket();
      ticket.create({type: 'mitigation'}).then(function(ticket) {
        debugTicketCounter(ticket);
        expect(ticket.type).to.equal('mitigation');
        done();
      }, function(err) {
        failOnError(err.toString());
      }).done();
    });

    it('should have a blank type if one is not supplied', function(done) {
      var ticket = new Ticket();
      ticket.create().then(function(ticket) {
        debugTicketCounter(ticket);
        expect(ticket.type).to.equal('');
        done();
      }, function(err) {
        failOnError(err.toString());
      }).done();
    });

    it('should generate a counter for the ticket', function(done) {
      var ticket = new Ticket();
      ticket.create().then(function(ticket) {
        debugTicketCounter(ticket);
        var key = KeyGen.ticketCounterKey();
        // Get the generated counter
        return db.get(key);
      })
      .then(function(reply) {
          var num = parseInt(reply);
          expect(num).to.equal(ticket.num);
          done();
      }, function(err) {
        failOnError(err.toString());
      }).done();
    });

    it('should save the ticket key in the tickets set', function(done) {
      var ticket = new Ticket();
      ticket.create().then(function(ticket) {
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
      var ticket = new Ticket();
      ticket.create({ creator: user, type: 'mitigation'}).then(function(ticket) {
        debugTicketCounter(ticket);
        // Key to this ticket
        var ticketKey = KeyGen.ticketKey(ticket);
        // Get the value pointed to by the key
        db.hgetall(ticketKey).then(function(reply){
          expect(reply.type).to.equal('mitigation');
          expect(reply.creator).to.equal('testUser');
          done();
        }, function(err) {
          failOnError(err.toString());
        }).done();
      });
    });
  });

  describe('#getTicket', function(done) {

    it('should return the stored ticket data', function(done) {
      var ticket = new Ticket();
      ticket.create({creator: user, type: 'mitigation'}).then(function(ticket) {
        debugTicketCounter(ticket);
        var key = KeyGen.ticketKey(ticket);
        var lookedupTicket = new Ticket();
        lookedupTicket.getTicket(key).then(function(ticket2) {
          expect(ticket2.creator).to.equal('testUser');
          expect(ticket2.type).to.equal('mitigation');
          done();
        });
      });
    });
  });

  describe('#getAllTickets', function(done) {
    it('should return all ticket keys', function(done) {
      var ticket = new Ticket();
      ticket.getAllTickets().then(function(reply) {
        expect(reply).not.to.be.empty;
        done();
      });
    });
  });

  describe('#addTopic', function(done) {
    it('should return a topic object', function(done) {
      var ticket = new Ticket();
      ticket.create({creator: user, type: 'mitigation'}).then(function(ticket) {
        debugTicketCounter(ticket);
        ticket.addTopic(topicName1, topicDataType1, topicContents1)
          .then(function(reply) {
            expect(reply.parent.creator).to.equal('testUser');
            expect(reply.parent.type).to.equal('mitigation');
            expect(reply.parent.num).to.equal(createCounter);
            expect(reply.type).to.equal('mitigation');
            expect(reply.name).to.equal(topicName1);
            expect(reply.dataType).to.equal(topicDataType1);
            done();
          });
      });
    });

    it('should save the content to the database correctly', function(done) {
      var ticket = new Ticket();
      ticket.create({creator: user, type: 'mitigation'}).then(function(ticket) {
        debugTicketCounter(ticket);
        ticket.addTopic(topicName1, topicDataType1, topicContents1)
          .then(function(reply) {
            var key = KeyGen.topicKey(reply);
            db.hgetall(key).then(function(reply) {
              expect(reply).to.eql(topicContents1);
              done();
            }, function(err, reply) {
              failOnError(err.toString());
            }).done();
          });
      });
    });

    it('should save the topic key to the set of topics', function(done) {
      var ticket = new Ticket();
      ticket.create({creator: user, type: 'mitigation'}).then(function(ticket) {
        debugTicketCounter(ticket);
        ticket.addTopic(topicName1, topicDataType1, topicContents1)
          .then(function(reply) {
            db.zrank(KeyGen.topicListKey(ticket), KeyGen.topicKey(reply)).then(function(reply) {
              expect(reply).not.to.equal(null);
              done();
            }, function(err, reply) {
              failOnError(err.toString());
            }).done();
          });
      });
    });
  });
    
 
  describe('#getTopicKeys', function(done) {   
   
    it('should retrieve all topic keys from a ticket', function(done) {
      var ticket = new Ticket();
      ticket.create({creator: user, type: 'mitigation'}).then(function(ticket) {
        debugTicketCounter(ticket);
        ticket.addTopic(topicName1, topicDataType1, topicContents1).then(function(topic1) {
          // Get the topics
          ticket.getTopicKeys().then(function(keys) {
            expect(keys).not.to.be.empty;
            expect(keys).to.be.instanceof(Array);
            expect(keys).to.have.length(1);
            // Add another topic
            ticket.addTopic(topicName2, topicDataType2, topicContents2).then(function(topic2) {
              ticket.getTopicKeys().then(function(keys) {
                expect(keys).not.to.be.empty;
                expect(keys).to.be.instanceof(Array);
                expect(keys).to.have.length(2);
                done();
              });
            });
          });         
        });
      });
    });
  });

  describe('#topicFromKey', function(done) {

    it('should return the topic object ', function(done) {
      var ticket = new Ticket();
      var expectedTopic = {};
      ticket.create({creator: user, type: 'mitigation'}).then(function(ticket) {
        debugTicketCounter(ticket);
        ticket.addTopic(topicName1, topicDataType1, topicContents1).then(function(topic) {
          expectedTopic = topic;
          // Get the topic key
          var key = KeyGen.topicKey(topic);
          ticket.topicFromKey(key).then(function(reply) {
            expect(reply).to.eql(expectedTopic);
            done();
          });
        });
      });

    });
  });

  describe('#getTopics', function(done) {
    it('should retrieve all topics from a ticket', function(done) {
      var ticket = new Ticket();
      ticket.create({creator: user, type: 'mitigation'}).then(function(ticket) {
        debugTicketCounter(ticket);
        ticket.addTopic(topicName1, topicDataType1, topicContents1).then(function(topic1) {
          // Add another topic
            ticket.addTopic(topicName2, topicDataType2, topicContents2).then(function(topic2) {
              ticket.getTopics().then(function(topics) {
                expect(topics).not.to.be.empty;
                expect(topics).to.be.instanceof(Array);
                expect(topics).to.have.length(2);
                expect(topics[0]).to.eql(topic1);
                expect(topics[1]).to.eql(topic2);
                done();
              });
            });       
        });
      });
    });
  });

});


// EOF
