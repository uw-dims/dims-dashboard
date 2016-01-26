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
