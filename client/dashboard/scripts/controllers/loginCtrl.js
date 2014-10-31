'use strict';
angular.module('dimsDashboard.controllers').
  controller('LoginCtrl', ['$scope', 'AuthService', '$location', '$log', 'UsersessionService', 
      function($scope, AuthService, $location, $log, UsersessionService) {
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
          // Get the session data
          UsersessionService.get(function(session) {
            $log.debug('UsersessionService get, session is ', session);
            $location.path('/');
          });
          
        } else {
          $scope.errors.other = err;
          $log.debug('LoginCtrl login error', err);
        }
      });
    };

  }]);