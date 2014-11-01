'use strict';
angular.module('dimsDashboard.controllers').
  controller('LoginCtrl', ['$scope', 'AuthService', '$location', '$log', 'SettingsService', 
      function($scope, AuthService, $location, $log, SettingsService) {
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
          // Get the settings data
            // SettingsService.updateSettings().then(function(data) {
            //   $log.debug('logn updateSettings promise. data is ', data);
                $location.path('/');
              // });
          
        } else {
          $scope.errors.other = err;
          $log.debug('LoginCtrl login error', err);
        }
      });
    };

  }]);