'use strict';

angular.module('dimsDashboard.controllers').
  controller('MessagingCtrl', ['$scope', '$rootScope','$modalInstance','$location', '$routeParams', '$log', 
    'ChatService', 'LogService',
    function ($scope, $rootScope, $modalInstance, $location, $routeParams, $log, ChatService, LogService) {

  // $log.debug('messagingCtrl. settings are ', $scope.settings);
  // $log.debug('settingsCtrl. formData ', $scope.settingsFormData);

  

    $scope.messageKind = {
      rpcDebug: 'You successfully changed the value of the RPC Debug flag',
      rpcVerbose: 'You successfully changed the value of the RPC Verbose flag',
      anonymize: 'You successfully toggled the anonymization flag',
      cifbulkQueue: 'You successfully chose a queue for the cif query'
    };

  $scope.message = 'Each setting can be changed by choosing a new value from the pop-up menu.';

  $scope.logs = [];

  // Set current value of socket states
  $rootScope.logmonOn = LogService.isRunning();
  $rootScope.chatOn = ChatService.isRunning();

  $log.debug('Log and Chat are ', $scope.logmonOn, $scope.chatOn);

  $scope.toggleLogMonitor = function() {
      if ($scope.logmonOn) {
        // Turn it off
        $rootScope.logmonOn = false;
        $
        $log.debug('Turning log monitor off');
        LogService.stop();
      } else {
        // Turn it on
        $rootScope.logmonOn = true;
        $log.debug('Turning log monitor on');
        LogService.start();
      }
    };

    $scope.toggleChat = function() {
      if ($scope.chatOn) {
        // Turn it off
        $rootScope.chatOn = false;
        $log.debug('Turning chat off');
        ChatService.stop();
      } else {
        // Turn it on
        $rootScope.chatOn = true;
        $log.debug('Turning chat on');
        ChatService.start();
      }
    };

  $scope.ok = function() {
    $modalInstance.close('close');
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

}]);