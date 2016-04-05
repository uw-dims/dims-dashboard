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
angular.module('dimsDashboard.services')

  .factory('UserApi', ['$resource', function ($resource) {
    return $resource('/api/user/:id');
  }])

  .factory('UserService', ['UserApi', '$log', '$q', function (UserApi, $log, $q) {

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
          $log.error('UserService.getUsers failure callback err: ', err);
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
          $log.error('UserService.getUser failure callback err: ', err);
          deferred.reject(err);
        });
      return deferred.promise;
    };

    return UserService;
  }]);
