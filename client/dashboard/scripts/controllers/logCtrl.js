'use strict';

angular.module('dimsDashboard.controllers').
  controller('LogCtrl', function($scope, $location, $log, LogService, $rootScope) {

    $log.debug('logCtrl. scope.currentUser is ', $scope.currentUser);
    
    $scope.logMaximized = true;
    $scope.logClass = 'logMax';
    $scope.messages = '';
    $scope.offListen = function() {};

    $scope.listener = function(event) {
    	if (event === 'start') {
    		$scope.start();
    	} else if (event === 'stop') {
    		$scope.stop();
    	}
    };
    // Register as a listener for LogService
    LogService.registerObserverCallback($scope.listener);

    $scope.close = function() {
    	$log.debug('logCtrl.close');
    	$rootScope.logmonOn = false;
    	LogService.setRunning(false);
    	$scope.offListen();
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

    $scope.start = function(){
    	LogService.setRunning(true);
    	$scope.messages = ''; // Re-initialize messages
    	// Add listener for socket:logs:data broadcast
    	$scope.offListen = $scope.$on('socket:logs:data', function(event, data) {
	      if (!data) {
	        $log.error('LogCtrl: Invalid message. ', 'event: ', event, 'data: ', JSON.stringify(data));
	        return;
	      }
	      $scope.$apply(function() {
	        $scope.messages = $scope.messages + formatter(new Date(), data);
	      });
	    });
	   };

	   $scope.stop = function() {
	   	// Remove listener for socket:logs:data broadcast
	   	$scope.offListen();
	   	$rootScope.logmonOn = false;
	   	LogService.setRunning(false);
	   };

    var formatter = function(date, message) {
      return message + '\n';
    };

  });