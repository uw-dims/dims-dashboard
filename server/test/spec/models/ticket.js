'use strict'

var Ticket = require('../../../models/ticket');
var redis = require('redis');
var logger = require('../../../utils/logger');
var KeyGen = require('../../../models/keyGen');

var client,
    user = 'testUser'; // Simulates logged in user

client = redis.createClient();
// Select database 4 for testing
client.select(4);
redis.debug_mode = false;
client.on('error', function(err) {
  logger.info('Received error event: '+err);
});
client.on('ready', function() {
  logger.info('Received connect event: version is ', client.server_info.redis_version);
});

after(function(done) {
  logger.info('Quitting redis');
  client.flushdb(function(reply) {
    logger.info('flushdb reply ',reply);
    client.quit(function(err, reply) {
      logger.info('quit reply ',reply);
      done();
    });
  });
  
});

describe('Ticket', function() {

  beforeEach(function() {
    //
    
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
    // done();
  });

  // Test the create method
  describe('#create', function(done) {
    it('should generate a counter for the ticket', function(done) {
      var ticket = new Ticket(client,user);
      ticket.create().then(function(ticket) {
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
        var setKey = KeyGen.ticketSetKey();
        var ticketKey = KeyGen.ticketKey(ticket);
        ticket.client.sismember(setKey,ticketKey, function(err,data) {
          expect(data).to.equal(1);
          done();
        });
      });
    });
    it('should set the ticket value to empty', function(done) {
      var ticket = new Ticket(client,user);
      ticket.create().then(function(ticket) {
        var ticketKey = KeyGen.ticketKey(ticket);
        ticket.client.get(ticketKey, function(err, data){
          expect(data).to.equal('');
          done();
        });
      });
    });
  });

  // Test the addTopic method

});

// EOF
