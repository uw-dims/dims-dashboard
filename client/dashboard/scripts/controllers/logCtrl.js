'use strict';

angular.module('dimsDashboard.controllers').
  controller('LogCtrl', function($scope, $location, $log) {

    $log.debug('logCtrl. scope.currentUser is ', $scope.currentUser);

    $scope.close = function() {
      
    };

    $scope.hide = function() {

    };
  });