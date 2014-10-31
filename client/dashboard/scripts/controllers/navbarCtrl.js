'use strict';

angular.module('dimsDashboard.controllers').
  controller('NavbarCtrl', function($scope, AuthService, $location, $log) {

    $log.debug('navbarCtrl. scope.currentUser is ', $scope.currentUser);

    $scope.logout = function() {
      AuthService.logout(function(err) {
        if(!err) {
          $location.path('/login');
        }
      });
    };
  });