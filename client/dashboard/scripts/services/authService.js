'use strict';

angular.module('dimsDashboard.services')
  
    .factory('AuthService', function($location, $rootScope, SessionService, $cookieStore, $log, SettingsService, ChatService, LogService, ChatSocket, LogSocket) {

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
            password: user.password
          }, 
          function(resource) {
            $log.debug('AuthService:login success callback. data is ', resource.data);
            $rootScope.currentUser = resource.data.user;
            SettingsService.data= resource.data.settings;
            return cb();
          }, 
          // Failure, send error to callback
          function(err) {
            $log.debug('AuthService:login failure callback. err is ', err);
            return cb(err.data);
          });
        },

        logout: function(callback) {
          $log.debug('AuthService:logout');
          var cb = callback || angular.noop;
          ChatService.stop();
          LogService.stop();
          ChatSocket.then(function(socket) {
            socket.removeAllListeners('chat:data');
            socket.disconnect();
          });
          LogSocket.then(function(socket) {
            socket.removeAllListeners('logs:data');
            socket.disconnect();
          })
          SessionService.delete(function(res) {
              $rootScope.currentUser = null;
              return cb();
            },
            function(err) {
              return cb(err.data);
            });
        },

        currentUser: function(callback) {
          $log.debug('AuthService:currentUser');
          var cb = callback || angular.noop;
          SessionService.get(function(resource) {
            $log.debug('AuthService:currentUser. data returned from session is ', resource.data);
            $rootScope.currentUser = resource.data.user;
            SettingsService.data = resource.data.settings;
            $rootScope.$emit('authenticated');
          });
        }
      }
  });