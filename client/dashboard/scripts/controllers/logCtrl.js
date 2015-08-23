'use strict';

angular.module('dimsDashboard.controllers').
  controller('LogCtrl', function ($scope, $location, $log, LogService, $rootScope) {

    $log.debug('logCtrl. scope.currentUser is ', $scope.currentUser);

    // Initialize
    $scope.logMaximized = true;
    $scope.logClass = 'logMax';
    $scope.messages = '';

    $scope.offListen = function () {};

    // Listener for start and stop events. Will register as an Observer callback
    // for LogService
    $scope.listener = function (event) {
      if (event === 'start') {
        $scope.start();
      } else if (event === 'stop') {
        $scope.stop();
      }
    };

    // Register as a listener for LogService
    LogService.registerObserverCallback($scope.listener);

    // Close the log monitor
    $scope.close = function () {
      $log.debug('controllers/LogCtrl.close');
      $rootScope.logmonOn = false;
      LogService.setRunning(false);
      $scope.offListen();
    };

    // Hide the log monitor
    $scope.hide = function () {
      $log.debug('controllers/LogCtrl.hide');
      $scope.logMaximized = false;
      $scope.logClass = 'logMin';
    };

    // Show the log monitor
    $scope.show = function () {
      $log.debug('controllers/LogCtrl.show');
      $scope.logMaximized = true;
      $scope.logClass = 'logMax';
    };

    // Start the log monitor
    $scope.start = function () {
      LogService.setRunning(true);
      $scope.messages = ''; // Re-initialize messages
      $log.debug('controllers/LogCtrl event is ', constants.logEvent);
      // Add listener for socket:constants.logEvent broadcast
      $scope.offListen = $scope.$on('socket:' + constants.logEvent, function (event, data) {
        $log.debug('LogCtrl: got a message ', event.name, data);
        if (!data) {
          $log.error('controllers/LogCtrl: Invalid message. ', 'event: ', event, 'data: ', JSON.stringify(data));
          return;
        }
        $scope.$apply(function () {
          $scope.messages = $scope.messages + formatter(new Date(), data);
        });
      });
    };

    $scope.stop = function () {
      // Remove listener for socket:constants.logEvent broadcast
      $scope.offListen();
      $rootScope.logmonOn = false;
      LogService.setRunning(false);
    };

    var formatter = function (date, message) {
      return message + '\n';
    };

  });
