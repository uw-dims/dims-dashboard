'use strict';

angular.module('dimsDashboard.controllers').
  controller('LogCtrl', function($scope, $location, $log, LogService, $rootScope) {

    $log.debug('logCtrl. scope.currentUser is ', $scope.currentUser);
    
    $scope.logMaximized = true;
    $scope.logClass = 'logMax';

    $scope.close = function() {
    	$log.debug('logCtrl.close');
    	$rootScope.logmonOn = false;
    	LogService.stop();
    };

    $scope.hide = function() {
    	$log.debug('logCtrl.hide');
    	$scope.logMaximized = false;
    	$scope.logClass = 'logMin';
    };

    $scope.show = function() {
    	$log.debug('logCtrl.show');
    	$scope.logMaximized = true;
    	$scope.logClass = 'logMax';
    };

    $scope.$on('socket:log:data', function(event, data) {
      $log.debug('LogCtrl: got a message ', event.name, data);
      if (!data.payload) {
        $log.error('LogCtrl: Invalid message', 'event', event, 'data', JSON.stringify(data));
        return;
      }
      $scope.$apply(function() {
        $scope.messages = formatter(new Date(), data.payload) + $scope.messages;
      });
    });

  });