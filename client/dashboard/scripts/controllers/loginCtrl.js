'use strict';
angular.module('dimsDashboard.controllers').
  controller('LoginCtrl', ['$scope', 'AuthService', '$location', '$log','$rootScope', 'SettingsService', 
      function($scope, AuthService, $location, $log, $rootScope, SettingsService) {
    $scope.error = {};
    $scope.user = {};

    $log.debug('LoginCtrl controller');

    $scope.login = function(form) {
      AuthService.login('password', {
        'username': $scope.user.username,
        'password': $scope.user.password
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