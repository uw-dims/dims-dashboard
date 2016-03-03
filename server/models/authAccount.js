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

var q = require('q');
var keyGen = require('./keyGen');
var _ = require('lodash-compat');

module.exports = function (client) {

  var authAccount = {};

  // Get the user for an id and service. Return null if key doesn't exist
  authAccount.getUser = function getUser(id, service) {
    return client.getAsync(keyGen.accountIdKey(id, service));
  };

  // Set the user for an id and service. Return ok if executed correctly
  authAccount.setUser = function setUser(id, service, user) {
    return client.setAsync(keyGen.accountIdKey(id, service), user);
  };

  // Get the account profile for a user/service
  authAccount.getAccount = function getAccount(user, service) {
    return client.hgetallAsync(keyGen.accountUserKey(user, service));
  };

  // Update or create account for a user and service
  authAccount.setAccount = function setAccount(user, service, profile) {
    var promises = [];
    // promise to save/update the account for the user. Returns ok if successful
    promises.push(client.hmsetAsync(keyGen.accountUserKey(user, service), profile));
    // promise to add the key to the set of keys for the user. Returns number of keys added
    promises.push(client.saddAsync(keyGen.accountUserSetKey(user), keyGen.accountUserKey(user, service)));
    return q.all(promises);
  };

  // Get all social accounts for a user
  authAccount.getAccounts = function getAccounts(user) {
    // Will return empty array if key doesn't exist
    return client.smembersAsync(keyGen.accountUserSetKey(user))
    .then(function (reply) {
      if (reply.length === 0) {
        return q.fcall(function () {
          return [];
        });
      }
      var promises = [];
      _.forEach(reply, function (value) {
        promises.push(client.hgetallAsync(value));
      });
      return q.all(promises);
    })
    .catch(function (err) {
      // No results
      console.log('authAccount.getAccounts error', err);
      return q.fcall(function () {
        return [];
      });
    });
  };

  authAccount.createAccount = function createAccount(user, service, profile) {
    var promises = [];
    promises.push(authAccount.setUser(profile.id, service, user));
    promises.push(authAccount.setAccount(user, service, profile));
    return q.all(promises);
  };

  authAccount.deleteAccount = function deleteAccount(user, service) {
    var promises = [];
    // Get the account profile
    return client.hgetallAsync(keyGen.accountUserKey(user, service))
    .then (function (reply) {
      if (reply !== null) {
        // Account exists - delete keys
        promises.push(client.delAsync(keyGen.accountUserKey(user, service)));
        promises.push(client.delAsync(keyGen.accountIdKey(reply.id, service)));
        // Remove key from set
        promises.push(client.sremAsync(keyGen.accountUserSetKey(user), keyGen.accountUserKey(user, service)));
      } else {
        promises.push(q.fcall(function () {
          return 'Service does not exist';
        }));
      }
      return q.all(promises);
    })
    .catch(function (err) {
      throw err;
    });
  };

  return authAccount;

};
