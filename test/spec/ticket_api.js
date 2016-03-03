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

