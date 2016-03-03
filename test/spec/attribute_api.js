/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
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

