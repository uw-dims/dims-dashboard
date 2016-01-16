'use strict';

angular.module('dimsDashboard.services')

    .factory('AuthService', function ($location, $rootScope, SessionService, $cookieStore, $log, $window, SettingsService, ChatService) {

      $rootScope.currentUser = $cookieStore.get('user') || null;
      $log.debug('AuthService: rootScope.currentUser from cookieStore is ', $rootScope.currentUser);
      $cookieStore.remove('user');

      return {

        login: function (provider, user, callback) {
          $log.debug('AuthService:login');
          var cb = callback || angular.noop;
          SessionService.save({
            provider: provider,
            username: user.username,
            password: user.password
          },
          function (resource) {
            $log.debug('AuthService:login success callback. data is ', resource.data);
            var userData = resource.data.login.sessionObject;
            // $rootScope.currentUser = resource.data.user;
            // $rootScope.currentUser.currentTg = resource.data.settings.currentTg;
            // SettingsService.data = resource.data.settings;
            $rootScope.currentUser = userData.user;
            $rootScope.currentUser.currentTg = userData.settings.currentTg;
            SettingsService.set(userData.settings);
            $window.sessionStorage.token = resource.data.login.token;
            return cb();
          },
          // Failure, send error to callback
          function (err) {
            $log.debug('AuthService:login failure callback. err is ', err);
            delete $window.sessionStorage.token;
            return cb(err.data.message);
          });
        },

        logout: function (callback) {
          $log.debug('AuthService:logout');
          var cb = callback || angular.noop;
          $rootScope.$emit('logout');
          ChatService.stop();
          SessionService.delete(function (res) {
              $rootScope.currentUser = null;
              // Do this here or in SessionService.delete?
              delete $window.sessionStorage.token;
              return cb();
            },
            function (err) {
              return cb(err.data.message);
            });
        },

        currentUser: function (callback) {
          $log.debug('AuthService:currentUser');
          var cb = callback || angular.noop;
          SessionService.get(function (resource) {
            $log.debug('AuthService:currentUser. data returned from session is ', resource.data);
            $rootScope.currentUser = resource.data.user;
            $rootScope.currentUser.currentTg = resource.data.settings.currentTg;
            SettingsService.data = resource.data.settings;
            $rootScope.$emit('authenticated');
            $rootScope.$broadcast('currentUser-ready');
          });
        }
      };
  });
