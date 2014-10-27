'use strict';

angular.module('dimsDashboard.controllers').
  controller('NavbarCtrl', function($scope, AuthService, $location) {
    $scope.logout = function() {
      AuthService.logout(function(err) {
        if(!err) {
          $location.path('/login');
        }
      });
    };
  });