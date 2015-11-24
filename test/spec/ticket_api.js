'use strict';
var frisby = require('icedfrisby');
var Joi = require('joi');
var URL = 'http://localhost:3000/api/ticket';
console.log('Test Ticket API');

var ticket2user = 'testuser2';
var ticket2type = 'data';
var ticket2create = {
  creator: ticket2user,
  type: ticket2type
};

frisby.create('GET all tickets')
  .get(URL)
  .expectStatus(200)
  .inspectJSON()
  .expectJSONLength(1)
  .expectJSONLength('data', 1)
  .expectJSON({
    'data': ['dims:ticket:1']
  })
  .toss();

frisby.create('Get a ticket')
  .get(URL + '/dims:ticket:1')
  .inspectJSON()
  .expectStatus(200)
  .expectJSONLength(1)
  .expectJSONLength('data', 3)
  .expectJSONLength('data.topics', 8)
  .expectJSONLength('data.ticket', 6)
  .expectJSONTypes('data', Joi.object().keys({
    ticket: Joi.object(),
    key: Joi.string(),
    topics: Joi.array()
  }))
  .toss();

frisby.create('Try to get a non-existing ticket')
  .get(URL + '/dims:ticket:2')
  .expectStatus(400)
  .toss();

frisby.create('Show a topic')
  .get(URL + '/topic/dims:ticket:1:mitigation:data')
  .expectStatus(200)
  .expectJSONLength(1)
  .expectJSONLength('data', 3)
  .expectJSONLength('data.topic', 4)
  .expectJSONTypes('data', Joi.object().keys({
    topic: Joi.object(),
    content: Joi.array(),
    key: Joi.string()
  }))
  .toss();

frisby.create('Create a ticket')
  .post(URL, ticket2create, {json: true})
  .expectStatus(200)
  .toss();

