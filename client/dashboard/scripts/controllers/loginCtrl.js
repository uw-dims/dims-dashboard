'use strict';
angular.module('dimsDashboard.controllers').
  controller('LoginCtrl', ['$scope', 'AuthService', '$location', '$log', '$rootScope',
      function ($scope, AuthService, $location, $log, $rootScope) {
    $scope.error = '';
    $scope.user = {};

    $scope.login = function (form) {
      if ($scope.user.password === '' || $scope.user.username === '') {
        $scope.error = 'Enter a username and password';
      } else {
        AuthService.login('password', {
          'username': $scope.user.username,
          // 'password': encPass
          'password': $scope.user.password
        },
        // Callback
        function (err) {
          if (err) {
            $scope.error = err;
            $log.error('LoginCtrl login error', err);
          }
        });
      }
    };
  }]);
