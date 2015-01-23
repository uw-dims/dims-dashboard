'use strict';
angular.module('dimsDashboard.controllers').
  controller('LoginCtrl', ['$scope', 'AuthService', '$location', '$log','$rootScope', 'CryptoService','SettingsService', 
      function($scope, AuthService, $location, $log, $rootScope, CryptoService, SettingsService) {
    $scope.error = '';
    $scope.user = {};

    $log.debug('LoginCtrl controller');

    // var validInputs = function() {
    //   valid = false;
    //   if ($scope.user !== null && $scope.user !== undefined) {
    //     if ($scope.)
    //   }
    //   ($scope.user.password === '' || $scope.user.username === '')
    // }

    $scope.login = function(form) {
      if ($scope.user.password === '' || $scope.user.username === '') {
        $scope.error = 'Enter a username and password';

      } else {

        var userPass = $scope.user.password.toString();
        var encPass = CryptoService.encryptAES(userPass, constants.PASS_SECRET);
        
        AuthService.login('password', {
          'username': $scope.user.username,
          'password': encPass
        },
        function(err) {

          if (!err) {
            $location.path('/');
            // Emit event so socket can resolve
            $log.debug('LoginCtrl.login: Broadcast authenticated');
            $rootScope.$broadcast('authenticated');
            
          } else {
            $scope.error = err;
            $log.debug('LoginCtrl login error', err);
          }
        });

      }
      
    };

  }]);