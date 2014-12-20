'use strict';

angular.module('dimsDashboard.controllers').
  controller('SettingsCtrl', ['$scope', '$modalInstance','$location', '$routeParams', '$log', 'SettingsService',
    function ($scope, $modalInstance, $location, $routeParams, $log, SettingsService) {

  $scope.settings = SettingsService.get();
  $scope.settingsFormData = SettingsService.get();

  $log.debug('settingsCtrl. settings are ', $scope.settings);
  $log.debug('settingsCtrl. formData ', $scope.settingsFormData);

  // Setup form
  $scope.cifbulkQueueValues = [{
      value: 'cifbulk_v1',
      label: 'cifbulk_v1 - default'
    },{
      value: 'cifbulk_v1_test',
      label: 'cifbulk_v1 - default with debug and verbose'
    },{
      value: 'cifbulk_v1_demo',
      label: 'cifbulk_v1_demo - alternate queue'
    },{
      value: 'cifbulk_v1_demo_test',
      label: 'cifbulk_v1_demo_test - alternate queue with debug and verbose'
    }];

    $scope.anonymizeValues =[{
      value: 'true',
      label: 'Anonymization On'
    },{
      value: 'false',
      label: 'Anonymization Off'
    }];

    $scope.rpcDebugValues = [{
      value: 'true',
      label: 'RPC Client Debug On'
    },{
      value: 'false',
      label: 'RPC Client Debug Off'
    }];

    $scope.rpcVerboseValues = [{
      value: 'true',
      label: 'RPC Client Verbose On'
    },{
      value: 'false',
      label: 'RPC Client Verbose Off'
    }];

    $scope.messageKind = {
      rpcDebug: 'You successfully changed the value of the RPC Debug flag',
      rpcVerbose: 'You successfully changed the value of the RPC Verbose flag',
      anonymize: 'You successfully toggled the anonymization flag',
      cifbulkQueue: 'You successfully chose a queue for the cif query'
    };

  $scope.message = 'Each setting can be changed by choosing a new value from the pop-up menu.';

  $scope.setUserSettings = function(kind) {
    var settings = {};
    // settings.anonymize = $scope.settings.anonymize === 'false' ? 'true' : 'false';
    settings.anonymize = $scope.settingsFormData.anonymize;
    settings.cifbulkQueue = $scope.settingsFormData.cifbulkQueue;
    settings.rpcDebug = $scope.settingsFormData.rpcDebug;
    settings.rpcVerbose = $scope.settingsFormData.rpcVerbose;

    SettingsService.update(settings).then(function(resource) {
      $log.debug('success setting, data is ', resource.data);
      $scope.message = $scope.messageKind[kind];
    }), (function(err) {
      $log.debug('setUserSettings error', err);
    });
  };

  $scope.ok = function() {
    $modalInstance.close('close');
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

}]);






