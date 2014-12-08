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

var createCounter = 0;

var debugTicketCounter = function(ticket) {
  createCounter++;
  logger.debug('TEST:Ticket '+ createCounter +' created: ', ticket.paramString());  
};

var failOnError = function(err) {
  logger.debug('TEST: Error ', err);
  expect('Error').to.equal('Success');
};

describe('models/Topic', function() {

  // Perform first - flush the database
  before(function(done) {
    redisDB.flushdb(function(reply) {
      done();
    });
  });

  // describe('#create', function(done) {
  //   it('should save the topic dataType', function(done) {
  //     var ticket = new Ticket();
  //     var expectedDataType = topicDataType1;
  //     ticket.create({creator: user, type: 'mitigation'}).then(function(ticket) {
  //       debugTicketCounter(ticket);
  //       ticket.addTopic(topicName1, topicDataType1, topicContents1).then(function(topic) {
  //           var key = KeyGen.topicTypeKey(topic);
  //           db.get(key).then(function(reply) {
  //             expect(reply).to.equal(expectedDataType);
  //             done();
  //           })
  //       });
  //     });
  //   });
  // });

  describe('#getDataType', function(done) {
    it('should return the topic dataType', function(done) {
      var ticket = new Ticket();
      var expectedDataType = topicDataType1;
      ticket.create({creator: user, type: 'mitigation'}).then(function(ticket) {
        debugTicketCounter(ticket);
        ticket.addTopic(topicName1, topicDataType1, topicContents1).then(function(topic) {
          topic.getDataType().then(function(reply) {
            expect(reply).to.equal(expectedDataType);
            done();
          });         
        });
      });
    });
  });

});


