'use strict';

/* Services, factories */

angular.module('dimsDashboard.services')
  
  // .factory('AuthService', function($location, $rootScope, SessionService, User, $cookieStore) {
    .factory('AuthService', function($location, $rootScope, SessionService, $cookieStore, $log) {

      $rootScope.currentUser = $cookieStore.get('user') || null;
      $log.debug('AuthService: rootScope.currentUser from cookieStore is ', $rootScope.currentUser);
      $cookieStore.remove('user');

      return {

        login: function(provider, user, callback) {
          $log.debug('AuthService:login');
          var cb = callback || angular.noop;
          SessionService.save({
            provider: provider,
            username: user.username,
            password: user.password,
            rememberMe: user.rememberMe
          }, function(user) {
            $log.debug('AuthService:login callback user is ', user);
            $rootScope.currentUser = user.user;
            return cb();
          }, function(err) {
            return cb(err.data);
          });
        },

        logout: function(callback) {
          $log.debug('AuthService:logout');
          var cb = callback || angular.noop;
          SessionService.delete(function(res) {
              $rootScope.currentUser = null;
              return cb();
            },
            function(err) {
              return cb(err.data);
            });
        },

        currentUser: function() {
          SessionService.get(function(user) {
            $rootScope.currentUser = user;
            $log.debug('AuthService:currentUser. user is ', $rootScope.currentUser);
          });
        }
      }
  });