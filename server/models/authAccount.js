'use strict';

var q = require('q');

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

  authAccount.getUserId = function getUserId(user, service) {
    return client.getAsync(keyGen.accountUserKey(user, service));
  };

  authAccount.setUserId = function setUserId(user, service, id) {
    return client.setAsync(keyGen.accountUserKey(user, service), id);
  };

  authAccount.deleteService = function deleteService(user, service) {
    var promises = [];
    return client.getAsync(keyGen.accountUserKey(user, service))
    .then (function (reply) {
      if (reply !== null) {
        promises.push(client.delAsync(keyGen.accountUserKey(user, service)));
        promises.push(client.delAsync(keyGen.accoundIdKey(reply, service)));
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
