'use strict';
angular.module('dimsDashboard.controllers').
  controller('LoginCtrl', ['$scope', 'AuthService', '$location', '$log','$rootScope', 'CryptoService','SettingsService', 
      function($scope, AuthService, $location, $log, $rootScope, CryptoService, SettingsService) {
    $scope.error = {};
    $scope.user = {};

    $log.debug('LoginCtrl controller');

    $scope.login = function(form) {
      var userPass = $scope.user.password.toString();
      var encPass = CryptoService.encryptAES(userPass, constants.PASS_SECRET);
      
      AuthService.login('password', {
        'username': $scope.user.username,
        'password': encPass
      },
      function(err) {
        $scope.errors = {};

        if (!err) {
          $location.path('/');
          // Emit event so socket can resolve
          $log.debug('LoginCtrl.login: Broadcast authenticated');
          $rootScope.$broadcast('authenticated');
          
        } else {
          $scope.errors.other = err;
          $log.debug('LoginCtrl login error', err);
        }
      });
    };

  }]);