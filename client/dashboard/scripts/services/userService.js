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
      email: 'Email Address',
      name: 'Full Name',
      affiliation: 'Affiliation',
      sms: 'SMS Info',
      im: 'IM Info',
      tel: 'Phone Info',
      post: 'Postal Info',
      airport: 'Home Airport',
      bio: 'Biography'
    };

    UserService.convertToDisplay = function convertToDisplay(data) {
      var newData = {};
      _.each(fieldMapping, function (value, key, list) {
        newData[value] = data[key];
      });
      return newData;
    };

    UserService.keys = function keys(obj) {
      return obj ? Object.keys(obj) : [];
    };

    UserService.getUsers = function getUsers() {
      var deferred = $q.defer();
      UserApi.get({},
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
