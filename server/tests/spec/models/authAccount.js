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

var test = require('tape-catch');
var bluebird = require('bluebird');
var redis = require('redis');
var q = require('q');
var _ = require('lodash-compat');

var client = bluebird.promisifyAll(redis.createClient());
bluebird.promisifyAll(client.multi());
process.env.NODE_DEBUG = redis;
client.selectAsync(10).then (function (reply) {
})
.catch(function (err) {
  console.error(err.toString());
});

// module we're testing
var authAccount = require('../../../models/authAccount')(client);

// Populate test data
var user1 = 'testuser1',
    user2 = 'testuser2',
    service = 'google',
    id1 = '12345',
    id2 = '67891',
    profile1 = {
      id: id1,
      service: service,
      email: 'email1@example.com'
    },
    profile2 = {
      id: id2,
      service: service,
      email: 'email2@example.com'
    },
    okResult = 'OK';


var failOnError = function (err, assert) {
  console.log(err);
  assert.fail(err);
  assert.end();
};

test('models/authAccount.js: Can set user by id', function (assert) {
  authAccount.setUser(id1, service, user1)
  .then(function (reply) {
    assert.equal(reply, okResult, 'success result returned');
    return client.getAsync('dims:authaccount:' + service + ':' + id1);
  })
  .then(function (reply) {
    assert.equal(reply, user1, 'correct user is saved');
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });

});

test('models/authAccount.js: Can get user by id', function (assert) {
  authAccount.setUser(id1, service, user1)
  .then(function (reply) {
    return authAccount.getUser(id1, service);
  })
  .then(function (reply) {
    assert.equal(reply, user1, 'user was retrieved');
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/authAccount.js: Can set user account', function (assert) {
  authAccount.setAccount(user1, service, profile1)
  .then(function (reply) {
    // Setting an account does 2 actions
    assert.deepEqual(reply, [okResult, 1], 'success result returned');
    return client.hgetallAsync('dims:authaccount:' + service + ':' + user1);
  })
  .then(function (reply) {
    assert.deepEqual(reply, profile1, 'correct profile is saved');
    return client.sismember('dims:authaccount:' + user1 + '.__keys', 'dims:authaccount:' + service + ':' + user1);
  })
  .then(function (reply) {
    assert.equal(reply, true, 'Key was saved to set');
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});


test('models/authAccount.js: Can get user account', function (assert) {
  authAccount.setAccount(user2, service, profile2)
  .then(function (reply) {
    return authAccount.getAccount(user2, service);
  })
  .then(function (reply) {
    assert.deepEqual(reply, profile2, 'profile was retrieved');
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/authAccount.js: Can get user accounts', function (assert) {
  authAccount.createAccount(user1, service, profile2)
  .then(function (reply) {
    // Create another service for this user
    return authAccount.createAccount(user1, 'bob', profile1);
  })
  .then(function (reply) {
    return authAccount.getAccounts(user1);
  })
  .then(function (reply) {
    assert.equal(reply.length, 2, 'Array of two was returned');
    // assert.deepEqual(reply.sort(), [profile1, profile2].sort(), '2 profiles were returned');
    // Try to get non-existing accounts
    return authAccount.getAccounts(user2);
  })
  .then(function (reply) {
    assert.equal(reply.length, 0, 'Empty array returned for no profiles');
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });

});

test('models/authAccount.js: Can create and delete account', function (assert) {
  authAccount.createAccount(user1, service, profile2)
  .then(function (reply) {
    return (client.keysAsync('*'));
  })
  .then(function (reply) {
    assert.ok(_.includes(reply, 'dims:authaccount:testuser1.__keys'));
    assert.ok(_.includes(reply, 'dims:authaccount:testuser1.__keys'));
    assert.ok(_.includes(reply, 'dims:authaccount:testuser1.__keys'));
    return authAccount.deleteAccount(user1, service);
  })
  .then(function (reply) {
    console.log(reply);
    var promises = [];
    promises.push(client.existsAsync('dims:authaccount:' + service + ':' + id2));
    promises.push(client.existsAsync('dims:authaccount:' + service + ':' + user1));
    promises.push(client.existsAsync('dims:authaccount:' + user1 + '.__keys', 'dims:authaccount:' + service + ':' + user1));
    return q.all(promises);
  })
  .then(function (reply) {
    console.log(reply);
    return client.keysAsync('*');
  })
  .then(function (reply) {
    console.log(reply);
    return client.flushdbAsync();
  })
  .then(function () {
    assert.end();
  })
  .catch(function (err) {
    failOnError(err, assert);
  });
});

test('models/authAccount.js: Finished', function (assert) {
  client.quitAsync()
  .then(function (reply) {
    assert.end();
  })
  .catch(function (err) {
    console.error(err.toString());
    assert.end();
  });
});
