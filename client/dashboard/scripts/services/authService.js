'use strict';

(function () {
  var AuthApi = function ($resource) {
    return $resource('/auth/session');
  };

  // Not used due to cross domain issues when callback is called from google.
  // We just use an href link in the client to call this route, not $http
  var GoogleApi = function ($resource) {
    return $resource('/auth/google');
  };

  var ConnectApi = function ($resource) {
    return $resource('/auth/connect');
  };

  var AuthService = function (AuthApi, GoogleApi, ConnectApi, SettingsService,
      CryptoService, $log, $q, $rootScope, $window, $location) {

    var authService = {};

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
    // query.username = username returned from server. Are we using this?
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

    authService.socialConnect = function (callback) {
      var cb = callback || angular.noop;
      ConnectApi.get(function (resource) {
        $log.debug('successful return from ConnectApi', resource);
      },
      function (err) {
        $log.debug('error return from ConnectApi', err);
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
        $log.debug('authService.logout returned success from api');
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
      return err.data.status === 'fail' ? err.data.data.message : err.data.message;
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
  .factory('GoogleApi', GoogleApi)
  .factory('ConnectApi', ConnectApi)
  .factory('AuthService', AuthService);

  AuthApi.$inject = ['$resource'];
  GoogleApi.$inject = ['$resource'];
  ConnectApi.$inject = ['$resource'];
  AuthService.$inject = ['AuthApi', 'GoogleApi', 'ConnectApi', 'SettingsService',
      'CryptoService', '$log', '$q', '$rootScope', '$window', '$location'];

}());


