'use strict';
angular.module('dimsDashboard.controllers').
  controller('LoginCtrl', ['$scope', 'AuthService', '$location', '$log', function($scope, AuthService, $location, $log) {
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
        } else {
          angular.forEach(err.errors, function(error, field) {
            // form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.type;
            $log.debug('LoginCtrl login error', error.type);
          });
          $scope.error.other = err.message;
          $log.debug('LoginCtrl login error', err.message);
        }
      });
    };

  }]);