'use strict';
angular.module('dimsDashboard.controllers').
  controller('LoginCtrl', ['$scope', 'AuthService', '$location', '$log', '$rootScope', '$routeParams',
      function ($scope, AuthService, $location, $log, $rootScope, $routeParams) {
    $scope.error = '';
    $scope.user = {};

    $log.debug('loginCtrl routeParams', $routeParams);

    if ($routeParams.error) {
      $scope.errorHtml = $routeParams.error;
      $scope.showErrorHtml = true;
    } else {
      $scope.errorHtml = '';
      $scope.showErrorHtml = false;
    }

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
