// File: client/dashboard/scripts/services/userService.js

'use strict';
angular.module('dimsDashboard.services')

  .factory('UserApi', function ($resource) {
    return $resource('/api/user/:id');
  })

  .factory('UserService', function (UserApi, $log, $q) {

    var UserService = {};

    var fieldMapping = {
      username: 'Username',
      name: 'Full Name',
      email: 'Email Address',
      pgpkeyId: 'PGP Key ID',
      affiliation: 'Affiliation',
      sms: 'SMS Info',
      im: 'IM Info',
      phone: 'Phone Info',
      post: 'Postal Info',
      airport: 'Home Airport',
      bio: 'Biography',
      entered: 'Start Time',
      activity: 'Last Activity',
      admin: 'Admin',
      isSysadmin: 'SysAdmin',
      tgDescription: 'Trust Group',
      trustgroup: 'Trust Group ID',
      pgpkeyExpires: 'PGP Key Expiration'
    };

    var emailMapping = {
      email: 'Email',
      pgpkeyId: 'PGP Key ID',
      pgpkeyExpires: 'PGP Key Expiration'
    };

    // currently not used
    UserService.convertToDisplay = function convertToDisplay(data) {
      var newData = {};
      var emailArray = [];
      _.each(fieldMapping, function (value, key, list) {
        if (data[key] instanceof Array) {
          _.each(data[key], function (value, index, array) {
            var emailData = {};
            var originalData = value;
            _.each(emailMapping, function (value, key, list) {
              emailData[value] = originalData[key];
            });
            emailArray.push(emailData);
          });
          newData[value] = emailArray;
        } else {
          newData[value] = data[key];
        }
      });
      return newData;
    };

    UserService.keys = function keys(obj) {
      return obj ? Object.keys(obj) : [];
    };

    // Gets all users in a trust group (tg)
    UserService.getUsers = function getUsers(tg) {
      var deferred = $q.defer();
      UserApi.get({
        tg: tg
      },
        function (resource) {
          deferred.resolve(resource.data);
        }, function (err) {
          $log.debug('UserService.getUsers failure callback err: ', err);
          deferred.reject(err);
        });
      return deferred.promise;
    };

    // Gets info for user (username) in trust group (tg)
    UserService.getUser = function getUser(tg, username) {
      var deferred = $q.defer();
      UserApi.get({id: username,
        tg: tg
      },
        function (resource) {
          deferred.resolve(resource.data);
        }, function (err) {
          $log.debug('UserService.getUser failure callback err: ', err);
          deferred.reject(err);
        });
      return deferred.promise;
    };

    return UserService;
  });
