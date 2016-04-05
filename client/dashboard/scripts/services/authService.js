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

(function () {

  var AuthApi = function ($resource) {
    return $resource('/auth/session');
  };

  // Get information about connected social accounts
  var ConnectApi = function ($resource) {
    return $resource('/auth/connect/:service');
  };

  var AuthService = function (AuthApi, ConnectApi, SettingsService,
      CryptoService, $log, $q, $rootScope, $window, $location) {

    var authService = {};

    authService.socialAccounts = [];

    // Handle username/password logins
    authService.login = function (provider, user, callback) {
      var cb = callback || angular.noop;
      var encPass = CryptoService.encryptAES(user.password.toString(), constants.PASS_SECRET);
      AuthApi.save({
        provider: provider,
        username: user.username,
        password: encPass
      },
      function (resource) {
        setUser(resource.data.login.sessionObject);
        saveToken(resource.data.login.token);
        saveSettings(resource.data.login.sessionObject);
        emitLoginEvents();
        $location.path('/');
        return cb();
      },
      function (err) {
        deleteToken();
        return cb(getErrorMessage(err));
      });
    };

    // Handle return from social login callback
    // query.token = token returned from server
    authService.onSocialLogin = function (query) {
      saveToken(query.token);
      // Get session data for user encoded in token since token is
      // included in authorization headers of every request
      getCurrentUser(function (err) {
        if (err) {
          // logout();
          authService.logout();
        } else {
          emitLoginEvents();
          $location.path('/');
        }
      });
    };

    authService.getSocialAccounts = function (callback) {
      var cb = callback || angular.noop;
      ConnectApi.get(function (resource) {
        authService.socialAccounts = angular.copy(resource.data.accounts);
        return cb();
      },
      function (err) {
        $log.debug('error return from ConnectApi', err);
        return cb(getErrorMessage(err));
      });
    };

    authService.showToken  = function () {
      return $window.sessionStorage.token;
    };

    authService.disconnectSocialAccount = function (service, callback) {
      var cb = callback || angular.noop;
      ConnectApi.delete({service: service }, function (resource) {
        return cb();
      },
      function (err) {
        $log.debug('error return from ConnectApi.delete', err);
        return cb(getErrorMessage(err));
      });
    };

    authService.currentUser = function () {
      $log.debug('authService.currentUser');
      getCurrentUser(function (err) {
        if (err) {
          // logout();
          authService.logout();
        } else {
          emitLoginEvents();
        }
      });
    };

    authService.logout = function (callback) {
      var cb = callback || angular.noop;
      logout();
      // Stop the chat service - what about logs?
      AuthApi.delete(function (res) {
        return cb();
      },
      function (err) {
        $log.error('authService.logout returned error from api', err);
        return cb(getErrorMessage(err));
      });
    };

    function getCurrentUser(callback) {
      var cb = callback || angular.noop;
      AuthApi.get(function (resource) {
        setUser(resource.data);
        saveSettings(resource.data);
        return cb();
      },
      function (err) {
        $log.error('authService.getCurrentUser error', err);
        return cb(err);
      });
    }

    function logout() {
      emitLogoutEvents();
      deleteToken();
      removeUser();
      $location.path('/login');
    }

    function setUser(data) {
      $rootScope.currentUser = data.user;
      $rootScope.currentUser.currentTg = data.settings.currentTg;
    }

    function removeUser() {
      $rootScope.currentUser = null;
    }

    function emitLoginEvents() {
      $rootScope.$emit('authenticated');
      $rootScope.$broadcast('currentUser-ready');
    }

    function emitLogoutEvents() {
      $rootScope.$emit('logout');
    }

    function getErrorMessage(err) {
      if (typeof err.data === 'string') {
        return err.data;
      } else {
        return err.data.status === 'fail' ? err.data.data.message : err.data.message;
      }
    }

    function saveSettings(data) {
      SettingsService.set(data.settings);
    }

    function saveToken(token) {
      $window.sessionStorage.token = token;
    }

    function deleteToken() {
      delete $window.sessionStorage.token;
    }

    return authService;
  };

  angular.module('dimsDashboard.services')
  .factory('AuthApi', AuthApi)
  .factory('ConnectApi', ConnectApi)
  .factory('AuthService', AuthService);

  AuthApi.$inject = ['$resource'];
  ConnectApi.$inject = ['$resource'];
  AuthService.$inject = ['AuthApi', 'ConnectApi', 'SettingsService',
      'CryptoService', '$log', '$q', '$rootScope', '$window', '$location'];

}());


