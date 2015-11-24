'use strict';
var frisby = require('icedfrisby');
var Joi = require('joi');
var URL = 'http://localhost:3000/api/attributes';
console.log('Test Attributes API');

var newAttributes = {
  cidr: [ '214.9.88.0/22'],
  domain: ['node.com']
};
var invalidAttributes = { 'bob': 'yes'};
var invalidUser = '$$@'

frisby.create('GET all user attributes')
  .get(URL)
  .expectStatus(200)  
  .expectJSONLength(2)
  .expectJSONLength('data', 4)
  .expectJSONLength('data.testuser1', 2)
  .expectJSONTypes('data.testuser1', Joi.object().keys({
    cidr: Joi.array(),
    domain: Joi.array() 
  }))
  .toss();
frisby.create('GET JSON from attribute api - one user')
  .get(URL + '/testuser1')
  .expectStatus(200)
  .expectJSONLength(2)
  .expectJSONLength('data', 1)
  .expectJSONLength('data.testuser1', 2)
  .expectContainsJSON('data.testuser1', { cidr:
     [ '103.9.88.0/22',
       '188.190.96.0/19',
       '162.251.112.0/21',
       '212.235.0.0/17',
       '202.190.128.0/17',
       '178.213.184.0/21',
       '72.69.0.0/16',
       '189.203.240.0/24',
       '46.29.255.0/24',
       '178.18.24.0/23',
       '193.107.16.0/23',
       '176.119.3.0/24',
       '186.233.144.0/21',
       '93.170.128.0/22',
       '37.247.101.0/24',
       '177.36.152.0/23',
       '37.0.120.0/21' ]})
  .toss();

frisby.create('Update attributes for a user')
  .post(URL + '/testuser1', newAttributes, {json:true})
  .expectStatus(200)
  .after(function(err, res, body) {
    frisby.create('Read updated attributes for the user')
      .get(URL + '/testuser1')
      .expectStatus(200)
      .expectJSON('data.testuser1', newAttributes)
      .toss();
  })
  .toss();
  
frisby.create('Test for invalid input')
  .post(URL + '/testuser4', invalidAttributes, {json:true})
  .expectStatus(400)
  .post(URL + '/testuser4')
  .expectStatus(400)
  .post(URL + '/' + invalidUser, newAttributes, {json:true})
  .expectStatus(400)
  .toss();

