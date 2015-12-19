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
      activity: 'Last Activity'
    };

    var emailMapping = {
      email: 'Email',
      pgpkeyId: 'PGP Key ID',
      pgpkeyExpires: 'PGP Key Expiration'
    };

    UserService.convertToDisplay = function convertToDisplay(data) {
      var newData = {};
      var emailArray =[];
      _.each(fieldMapping, function (value, key, list) {
        if (data[key] instanceof Array) {
          $log.debug('is array ', data[key]);
          _.each(data[key], function (value, index, array) {
            var emailData = {};
            $log.debug('in each email value, index now', value, index);
            var originalData = value;
            _.each(emailMapping, function (value, key, list) {
              $log.debug('inner loop', value, key);
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

    UserService.getUsers = function getUsers(tg) {
      var deferred = $q.defer();
      UserApi.get({
        tg: tg
      },
        function (resource) {
          $log.debug('UserService.getUsers success callback data: ', resource.data);
          deferred.resolve(resource.data);
        }, function (err) {
          $log.debug('UserService.getUsers failure callback err: ', err);
          deferred.reject(err);
        });
      return deferred.promise;
    };

    UserService.getUser = function getUser(ident) {
      var deferred = $q.defer();
      UserApi.get({id: ident},
        function (resource) {
          $log.debug('UserService.getUser success callback data: ', resource.data);
          deferred.resolve(resource.data);
        }, function (err) {
          $log.debug('UserService.getUser failure callback err: ', err);
          deferred.resolve(err);
        });
      return deferred.promise;
    };

    return UserService;

  });
