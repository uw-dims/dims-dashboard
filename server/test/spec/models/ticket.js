'use strict'

var Ticket = require('../../../models/ticket');
var redis = require('redis');
var logger = require('../../../utils/logger');
var KeyGen = require('../../../models/keyGen');
var c = require('../../../config/redisScheme');

// Bootstrap some data
var client,
    user = 'testUser'; // Simulates logged in user

var topicName1 = 'cif1',
    topicContents1 = {
      'field1':'value1',
      'field2':'value2'
    },
    topicName2 = 'cif2',
    topicContents2 = {
      'field1':'value3',
      'field2':'value4'
    };

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

describe('Ticket', function() {

  // Perform first
  before(function(done) {
    // Get the redis client
    client = redis.createClient();
    // Select database 4 for testing
    client.select(4);
    redis.debug_mode = false;
    client.on('error', function(err) {
      logger.error('Received error event: '+err);
    });
    client.on('ready', function() {
      logger.debug('Received redis connect event: redis version is ', client.server_info.redis_version);
      done();
    });
  });

  // Test the constructor
  describe('#constructor', function(done) {   
    it('should know its name', function(done) {
      var ticket = new Ticket(client,user);
      expect(ticket.name).to.equal('testUser');
      done();
    });
    it('should have access to redis client', function(done) {
      var ticket = new Ticket(client,user);
      expect(ticket.client.server_info.redis_version).to.equal('2.8.12');
      done();
    });
  });

  // Test the create method
  describe('#create', function(done) {
    it('should generate a counter for the ticket', function(done) {
      var ticket = new Ticket(client,user);
      ticket.create().then(function(ticket) {
        logger.debug('Ticket 1 created: ', ticket.paramString());
        // Check num against current counter
        var key = KeyGen.ticketCounterKey();
        // Note ticket.num is integer. get always returns string
        ticket.client.get(key, function(err, data) {
          var num = parseInt(data);
          expect(num).to.equal(ticket.num);
          done();
        });
      });
    });
    it('should save the ticket key in the tickets set', function(done) {
      var ticket = new Ticket(client,user);
      ticket.create().then(function(ticket) {
        logger.debug('Ticket 2 created: ', ticket.paramString());
        // Key to set of tickets
        var setKey = KeyGen.ticketSetKey();
        // Key to this ticket
        var ticketKey = KeyGen.ticketKey(ticket);
        // This ticket should be in the tickets set
        ticket.client.sismember(setKey,ticketKey, function(err,data) {
          expect(data).to.equal(1);
          done();
        });
      });
    });
    it('should set the ticket value to empty', function(done) {
      var ticket = new Ticket(client,user);
      ticket.create().then(function(ticket) {
        logger.debug('Ticket 3 created: ', ticket.paramString());
        // Key to this ticket
        var ticketKey = KeyGen.ticketKey(ticket);
        // Get the value pointed to by the key
        ticket.client.get(ticketKey, function(err, data){
          expect(data).to.equal('');
          done();
        });
      });
    });
  });

  // Test the addTopic method
  describe('#addTopic', function(done) {
    
    it('should have a counter for each different topic added', function(done) {
      
      var ticket = new Ticket(client,user);
      ticket.create().then(function(ticket) {
        logger.debug('Ticket 4 created: ', ticket.paramString());
        // Get the topic list key for the ticket just created
        var expectedTopicListKey = KeyGen.ticketKey(ticket) + c.topicSuffix;
        var expectedTopicCounterKey = KeyGen.topicCounterKey(ticket, topicName1);
        logger.debug('expectedTopicCounterKey is ', expectedTopicCounterKey);
        ticket.addTopic(topicName1, topicContents1).then(function(topic1) {
          // Get the counter key for the topic
          ticket.client.get(expectedTopicCounterKey, function(err, data) {
            var num1 = parseInt(data);
            logger.debug('fullname is ', ticket.getTopicFullName(topicName1,num1));
            logger.debug('topic key is ', KeyGen.topicKey(topic1));
            expect(num1).to.equal(1);

            // Add another topice
            ticket.addTopic(topicName2, topicContents2).then(function(topic2) {
              ticket.client.get(KeyGen.topicCounterKey(ticket, topicName2), function(err, data2){
                var num2 = parseInt(data2);
                logger.debug('fullname is ', ticket.getTopicFullName(topicName2,num2));
                logger.debug('topic key is ', KeyGen.topicKey(topic2));
                expect(num2).to.equal(1);
                done();
              });
            });
          });
        });
      });
    }); 
    
    it('should increment counter when same topic is added', function(done) {
      
      var ticket = new Ticket(client,user);
      ticket.create().then(function(ticket) {
        logger.debug('Ticket 5 created: ', ticket.paramString());
        // Get the topic list key for the ticket just created
        var expectedTopicListKey = KeyGen.ticketKey(ticket) + c.topicSuffix;
        var expectedTopicCounterKey = KeyGen.topicCounterKey(ticket, topicName1);
        logger.debug('expectedTopicCounterKey is ', expectedTopicCounterKey);
        ticket.addTopic(topicName1, topicContents1).then(function(topic1) {
          // Get the counter key for the topic
          ticket.client.get(expectedTopicCounterKey, function(err, data) {
            var num1 = parseInt(data);
            logger.debug('fullname is ', ticket.getTopicFullName(topicName1,num1));
            logger.debug('topic key is ', KeyGen.topicKey(topic1));
            expect(num1).to.equal(1);

            // Add another topice
            ticket.addTopic(topicName1, topicContents2).then(function(topic2) {
              ticket.client.get(KeyGen.topicCounterKey(ticket, topicName1), function(err, data2){
                var num2 = parseInt(data2);
                logger.debug('fullname is ', ticket.getTopicFullName(topicName2,num2));
                logger.debug('topic key is ', KeyGen.topicKey(topic2));
                expect(num2).to.equal(2);
                done();
              });
            });
          });
        });
      });
    }); 

    

    it('should add the topic fullname to the list of topics for this ticket', function(done) {
      
      var ticket = new Ticket(client,user);
      // Create the ticket
      ticket.create().then(function(ticket) {
        logger.debug('Ticket 6 created: ', ticket.paramString());
        // Get the topic list key for the ticket just created
        var expectedTopicListKey = KeyGen.ticketKey(ticket) + c.topicSuffix;
        // Add a topic to the ticket. This is the first topic added, so num should be 1
        ticket.addTopic(topicName1, topicContents1).then(function(topic1) {
          // Fullname should be topiceName1.1
          var expectedTopicFullName = ticket.getTopicFullName(topicName1,1);
          // Pop the last topic fullname from the list and compare
          ticket.client.rpop(expectedTopicListKey, function(err, data) {
            if (err) done(err);
            expect(data).to.equal(expectedTopicFullName);
            done();
          });
        });
      });
    }); 

    it('should create the topic with the correct key', function(done) {    
      var ticket = new Ticket(client,user);
      // Create the ticket
      ticket.create().then(function(ticket) {
        logger.debug('Ticket 7 created: ', ticket.paramString());
        // Add a topic to the ticket. This is the first topic added, so num should be 1
        ticket.addTopic(topicName1, topicContents1).then(function(topic1) {
          var expectedTopicKey = 'ticket:7:testUser:cif1:1';
          var actualTopicKey = KeyGen.topicKey(topic1);
          expect(actualTopicKey).to.equal(expectedTopicKey);
          done();
        });
      });
    }); 

    it('should add the contents of the topic to the hash at topicKey', function(done) {    
      var ticket = new Ticket(client,user);
      // Create the ticket
      ticket.create().then(function(ticket) {
        logger.debug('Ticket 8 created: ', ticket.paramString());
        // Add a topic to the ticket. This is the first topic added, so num should be 1
        ticket.addTopic(topicName1, topicContents1).then(function(topic1) {
          var topicKey = KeyGen.topicKey(topic1);
          // Get the contents at the key
          ticket.client.hgetall(topicKey, function(err, data) {
            if (err) done(err);
            expect(JSON.stringify(data)).to.equal(JSON.stringify(topicContents1));
            done();
          });
          
        });
      });
    }); 

    it('should add the timestamp at timestamp key', function(done) {
      
      var ticket = new Ticket(client,user);
      // Create the ticket
      ticket.create().then(function(ticket) {
        logger.debug('Ticket 9 created: ', ticket.paramString());
        // Add a topic to the ticket. This is the first topic added, so num should be 1
        ticket.addTopic(topicName1, topicContents1).then(function(topic1) {
          // Get the timestamp key for the topic just created
          var actualTimestampKey = KeyGen.topicTimestampKey(topic1);
          // Get the expected timestamp key
          var expectedTimestampKey = 'ticket:9:testUser:cif1:1.__timestamp';
          expect(actualTimestampKey).to.equal(expectedTimestampKey);
          // Make sure the key exists
          ticket.client.get(actualTimestampKey, function(err, data) {
            if (err) done(err);
            logger.debug('timestamp is ', data);
            expect(data).to.exist;
            done();
          });
        });
      });
    }); 
  });

  // Test the constructor
  describe('#getTopicNames', function(done) {   
   
    it('should retrieve all topic names from a ticket', function(done) {
      var ticket = new Ticket(client,user);
      ticket.create().then(function(ticket) {
        logger.debug('Ticket 10 created: ', ticket.paramString());
        // Get the topic list key for the ticket just created
        var expectedTopicListKey = KeyGen.ticketKey(ticket) + c.topicSuffix;
        logger.debug('expectedTopicListKey is ', expectedTopicListKey);
        ticket.addTopic(topicName1, topicContents1).then(function(topic1) {
          var name1 = topic1.getName();
          expect(name1).to.equal('cif1.1');
          // Get the topics
          ticket.getTopicNames().then(function(topics) {
            expect(topics).not.to.be.empty;
            expect(topics).to.be.instanceof(Array);
            expect(topics).to.have.length(1);
            expect(topics).to.include('cif1.1');
            expect(topics).not.to.include('cif1.2');
            // Add another topic
            ticket.addTopic(topicName1, topicContents2).then(function(topic2) {
              var name2 = topic2.getName();
              expect(name2).to.equal('cif1.2');
              ticket.getTopicNames().then(function(topics) {
                expect(topics).not.to.be.empty;
                expect(topics).to.be.instanceof(Array);
                expect(topics).to.have.length(2);
                expect(topics).to.include('cif1.1');
                expect(topics).to.include('cif1.2');
                done();
              });
            });
          });         
        });
      });
    });

    it('should retrieve all topics from a ticket', function(done) {
      var ticket = new Ticket(client,user);
      ticket.create().then(function(ticket) {
        logger.debug('Ticket 11 created: ', ticket.paramString());
        // Get the topic list key for the ticket just created
        var expectedTopicListKey = KeyGen.ticketKey(ticket) + c.topicSuffix;
        logger.debug('expectedTopicListKey is ', expectedTopicListKey);
        ticket.addTopic(topicName1, topicContents1).then(function(topic1) {
          var name1 = topic1.getName();
          expect(name1).to.equal('cif1.1');
          // Get the topics
          ticket.getTopics().then(function(topics) {
            expect(topics).not.to.be.empty;
            expect(topics).to.be.instanceof(Array);
            expect(topics).to.have.length(1);
            expect(topics).to.have.deep.property('[0].name', 'cif1');
            expect(topics).to.have.deep.property('[0].num', 1);
            // Add another topic
            ticket.addTopic(topicName1, topicContents2).then(function(topic2) {
              var name2 = topic2.getName();
              expect(name2).to.equal('cif1.2');
              ticket.getTopics().then(function(topics) {
                expect(topics).not.to.be.empty;
                expect(topics).to.be.instanceof(Array);
                expect(topics).to.have.length(2);
                expect(topics).to.have.deep.property('[1].name', 'cif1');
                expect(topics).to.have.deep.property('[1].num', 2);
                done();
              });
            });
          });        
        });
      });
    });

  });

});

// EOF
