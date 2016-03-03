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

var test = require('tape');
var _ = require('lodash-compat');
// var logger = require('../../../utils/logger')(module);
var c = require('../../../config/redisScheme');

test('config/redisScheme.js: Should return correct root', function (assert) {
  assert.equal(c.makeRoot('ticket'), 'dims:ticket', 'Creates ticket root');
  assert.equal(c.makeRoot('file'), 'dims:file', 'Creates file root');
  assert.equal(c.makeRoot('userSetting'), 'dims:userSetting', 'Creates userSetting root');
  assert.equal(c.makeRoot('notification'), 'dims:notification', 'Creates notification root');
  assert.equal(c.makeRoot('data'), 'dims:data', 'Creates data root');
  assert.equal(c.makeRoot('query'), 'dims:query', 'Creates query root');
  assert.throws(function () {
    c.makeRoot('bob');
  }, {}, 'Invalid type throws error');
  assert.end();
});

test('config/redisScheme.js: Should return correct suffix', function (assert) {
  assert.equal(c.makeSuffix('counter'), '.__counter', 'Creates counter suffix');
  assert.equal(c.makeSuffix('metadata'), '.__meta', 'Creates metadata suffix');
  assert.equal(c.makeSuffix('all'), '.__keys', 'Creates all keys suffix');
  assert.equal(c.makeSuffix('open'), '.__open', 'Creates open keys suffix');
  assert.equal(c.makeSuffix('closed'), '.__closed', 'Creates closed keys suffix');
  assert.equal(c.makeSuffix('topics'), '.__topics', 'Creates topics suffix');
  assert.equal(c.makeSuffix('type', 'analysis'), '.__type.__analysis', 'Creates type suffix');
  assert.throws(function () {
    c.makeSuffix('type');
  }, {}, 'Missing type param throws error');
  assert.equal(c.makeSuffix('subscriptions', 'bob'), '.__subscriptions.__bob', 'Creates subscriptions suffix');
  assert.throws(function () {
    c.makeSuffix('subscriptions');
  }, {}, 'Missing subscriptions param throws error');
  assert.equal(c.makeSuffix('subscribers'), '.__subscribers', 'Creates subscribers suffix');
  assert.throws(function () {
    c.makeSuffix('bob');
  }, {}, 'Invalid type throws error');
  assert.end();
});

test('config/redisScheme.js: Should return correct base', function (assert) {
  assert.equal(c.makeBase('ticket'), 'dims:ticket', 'Creates base with no params');
  assert.equal(c.makeBase('ticket', 2), 'dims:ticket:2', 'Creates base with one param');
  assert.equal(c.makeBase('ticket', 2, 'bob'), 'dims:ticket:2:bob', 'Creates base with multiple params');
  assert.throws(function () {
    c.makeBase('bob', 2);
  }, {}, 'Invalid type throws error');
  assert.end();
});

test('config/redisScheme.js: Should add content to a key', function (assert) {
  assert.equal(c.addContent('bob:fred'), 'bob:fred', 'Works with null content');
  assert.equal(c.addContent('bob:fred', 'sally'), 'bob:fred:sally', 'Works with one content param');
  assert.equal(c.addContent('bob:fred', 'sally', 'sue'), 'bob:fred:sally:sue', 'Works with multiple content params');
  assert.doesNotThrow(function () {
    c.addContent('bob', 2);
  }, {}, 'Key value not restricted');
  assert.end();
});

test('config/redisScheme.js: Should add suffix to a key', function (assert) {
  assert.equal(c.addSuffix('bob:fred', 'counter'), 'bob:fred.__counter', 'Adds counter suffix to key');
  assert.equal(c.addSuffix('bob:fred', 'metadata'), 'bob:fred.__meta', 'Adds metadata suffix to key');
  assert.equal(c.addSuffix('bob:fred', 'subscriptions', 'sue'), 'bob:fred.__subscriptions.__sue', 'Adds subscriptions suffix to key');
  assert.end();
});

