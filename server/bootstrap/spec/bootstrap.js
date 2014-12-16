'use strict'

// File: server/bootstrap/spec/bootstrap.js

// This file will bootstrap some ticket data

var Ticket = require('../../models/ticket');
var db = require('../../utils/redisUtils');
var redisDB = require('../../utils/redisDB');
var redis = require('redis');
var logger = require('../../utils/logger');
var KeyGen = require('../../models/keyGen');
var c = require('../../config/redisScheme');
var q = require('q');
var fs = require('fs');

var users = ['lparsons', 'dittrich', 'eliot', 'stuart'];

var ticketConfig = [
  {
    user: users[0],
    type: 'data'
  },

  {
    user: users[1],
    type: 'analysis'
  },
  {
    user: users[2],
    type: 'data'
  },
  {
    user: users[3],
    type: 'analysis'
  }
];

var topicConfig = [
  {
    topic: 'storage:logcenter:logcenter-sizes-2.txt',
    dataType: 'hash',
    data: 'data/prisemTestData/logcenter-sizes-2.txt',
    shortDesc: 'Logcenter data usage vs. date',
    description: ''
  },
  {
    topic: 'storage:silk:silk-sizes-2.txt',
    dataType: 'hash',
    data: 'data/prisemTestData/silk-sizes-2.txt',
    shortDesc: 'SiLK data usage vs. date',
    description: ''
  },
  {
    topic: 'cif:65% Confidence',
    dataType: 'hash',
    data: 'data/prisemTestData/testcif1.txt',
    shortDesc: 'CIF 65% confidence results JSON',
    description: ''
  },
  {
    topic: 'cif:APT 1 intrusion set',
    dataType: 'hash',
    data: 'data/prisemTestData/testcif3a.txt',
    shortDesc: 'APT 1 intrusion set obtained via cross-correlation, testcif3',
    description: ''
  },
  {
    topic: 'cif:APT 1 intrusion search',
    dataType: 'hash',
    data: 'data/prisemTestData/testcif3.txt',
    shortDesc: 'APT 1 intrusion set CIF search results, testcif3',
    description: ''
  }
]

var ROOT_DIR = __dirname + '/../../';

logger.debug('ROOT_DIR is ', ROOT_DIR);

var createCounter;

var debugTicketCounter = function(ticket) {
  createCounter++;
  logger.debug('TEST:Ticket '+ createCounter +' created: ', ticket.paramString());  
};

var failOnError = function(err) {
  logger.debug('TEST: Error ', err);
  expect('Error').to.equal('Success');
};

// Perform first before first run. Flush the database
before(function(done) {
  // Get the redis db
  logger.debug('TEST: Performing before functions');
  redis.debug_mode = false;
  createCounter = 0;
  redisDB.flushdb(function(reply) {
    logger.debug('flushdb reply ',reply);
    done();
  });
});

describe('models/Ticket', function() {

  it('should create ticket 1', function(done) {

    var ticket = new Ticket();
    var topic1 = topicConfig[0];
    var topic2 = topicConfig[1];
    var stringData1 = fs.readFileSync(ROOT_DIR+topic1.data, {encoding: 'utf-8'});
    var stringData2 = fs.readFileSync(ROOT_DIR+topic2.data, {encoding: 'utf-8'});
    var data1 = {
      shortDesc: topic1.shortDesc,
      description: topic1.description,
      data: stringData1
    };
    var data2 = {
      shortDesc: topic2.shortDesc,
      description: topic2.description,
      data: stringData2
    };
    ticket.create(ticketConfig[0].type, ticketConfig[0].user).then(function(ticket) {
      debugTicketCounter(ticket);
      ticket.addTopic(topic1.topic, topic1.dataType, data1)
        .then(function(reply) {
          expect(reply.parent.creator).to.equal(ticketConfig[0].user);
          
          ticket.addTopic(topic2.topic, topic2.dataType, data2).then(function(reply) {
            done();
          });
        });
    });
  });

  it('should create ticket 2', function(done) {

    var ticket = new Ticket();
    var topic1 = topicConfig[2];
    var topic2 = topicConfig[3];
    var topic3 = topicConfig[4];
    var stringData1 = fs.readFileSync(ROOT_DIR+topic1.data, {encoding: 'utf-8'});
    var stringData2 = fs.readFileSync(ROOT_DIR+topic2.data, {encoding: 'utf-8'});
    var stringData3 = fs.readFileSync(ROOT_DIR+topic3.data, {encoding: 'utf-8'});
    var data1 = {
      shortDesc: topic1.shortDesc,
      description: topic1.description,
      data: stringData1
    };
    var data2 = {
      shortDesc: topic2.shortDesc,
      description: topic2.description,
      data: stringData2
    };
    var data3 = {
      shortDesc: topic3.shortDesc,
      description: topic3.description,
      data: stringData3
    };
    ticket.create(ticketConfig[1].type, ticketConfig[1].user).then(function(ticket) {
      debugTicketCounter(ticket);
      ticket.addTopic(topic1.topic, topic1.dataType, data1)
        .then(function(reply) {
          logger.debug('Added topic 1 to ticket 2, reply is ', reply);
          
          ticket.addTopic(topic2.topic, topic2.dataType, data2).then(function(reply) {
            logger.debug('Added topic 2 to ticket 2, reply is ', reply);
            ticket.addTopic(topic3.topic, topic3.dataType, data3).then(function(reply) {
              logger.debug('Added topic 3 to ticket 2, reply is ', reply);
              done();
            })
            
          });
        });
    });
  });

});