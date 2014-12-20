'use strict';

angular.module('dimsDashboard.controllers').
  controller('NavbarCtrl', function($scope, $modal, AuthService, $location, $log) {

    $log.debug('navbarCtrl. scope.currentUser is ', $scope.currentUser);

    $scope.logout = function() {
      AuthService.logout(function(err) {
        if(!err) {
          $location.path('/login');
        }
      });
    };

    $scope.settings = function(size) {

      var modalInstance = $modal.open({
        templateUrl: '../views/partials/settings.html',
        controller: 'SettingsCtrl'
      });

    };

    $scope.messaging = function(size) {

      var modalInstance = $modal.open({
        templateUrl: '../views/partials/messaging.html',
        controller: 'MessagingCtrl'
      });

    };
  });