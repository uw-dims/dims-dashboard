'use strict';
angular.module('dimsDashboard.controllers').
  controller('LoginCtrl', ['$scope', 'AuthService', '$location', '$log','$rootScope', '$crypto','SettingsService', 
      function($scope, AuthService, $location, $log, $rootScope, $crypto, SettingsService) {
    $scope.error = {};
    $scope.user = {};

    $log.debug('LoginCtrl controller');

    $scope.login = function(form) {
      var userPass = $scope.user.password.toString();
      var encPass = $crypto.encrypt($scope.user.password);
      AuthService.login('password', {
        'username': $scope.user.username,
        'password': encPass
      },
      function(err) {
        $scope.errors = {};

        if (!err) {
          $location.path('/');
          // Emit event so socket can resolve
          $rootScope.$broadcast('authenticated');
          
        } else {
          $scope.errors.other = err;
          $log.debug('LoginCtrl login error', err);
        }
      });
    };

  }]);