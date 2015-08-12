'use strict';

// File: client/dashboard/scripts/controllers/settingsCtrl.js

(function () {

  var SettingsCtrl = function ($scope, $modalInstance, $location, $log, SettingsService) {

    // Get the current settings - save in scope and in formData
    $scope.settings = SettingsService.get();
    $scope.settingsFormData = SettingsService.get();

    // Setup form
    $scope.cifbulkQueueValues = [{
        value: 'cifbulk_v1',
        label: 'cifbulk_v1 - default'
      }, {
        value: 'cifbulk_v1_test',
        label: 'cifbulk_v1 - default with debug and verbose'
      }, {
        value: 'cifbulk_v1_demo',
        label: 'cifbulk_v1_demo - alternate queue'
      }, {
        value: 'cifbulk_v1_demo_test',
        label: 'cifbulk_v1_demo_test - alternate queue with debug and verbose'
      }];

    $scope.anonymizeValues = [{
      value: true,
      label: 'Anonymization On'
    }, {
      value: false,
      label: 'Anonymization Off'
    }];

    $scope.rpcDebugValues = [{
      value: true,
      label: 'RPC Client Debug On'
    }, {
      value: false,
      label: 'RPC Client Debug Off'
    }];

    $scope.rpcVerboseValues = [{
      value: true,
      label: 'RPC Client Verbose On'
    }, {
      value: false,
      label: 'RPC Client Verbose Off'
    }];

    $scope.messageKind = {
      rpcDebug: 'You successfully changed the value of the RPC Debug flag',
      rpcVerbose: 'You successfully changed the value of the RPC Verbose flag',
      anonymize: 'You successfully toggled the anonymization flag',
      cifbulkQueue: 'You successfully chose a queue for the cif query'
    };

    $scope.message = 'Each setting can be changed by choosing a new value from the pop-up menu.';

    // Save user settings currently selected by User
    $scope.setUserSettings = function (kind) {
      // Construct the config
      var settings = {};
      settings.anonymize = $scope.settingsFormData.anonymize;
      settings.cifbulkQueue = $scope.settingsFormData.cifbulkQueue;
      settings.rpcDebug = $scope.settingsFormData.rpcDebug;
      settings.rpcVerbose = $scope.settingsFormData.rpcVerbose;

      // Call the service to save the settings
      SettingsService.update(settings).then(function (resource) {
        $log.debug('success setting, data is ', resource.data);
        $scope.message = $scope.messageKind[kind];
      }), (function (err) {
        $log.debug('setUserSettings error', err);
      });
    };

    // OK button handler
    $scope.ok = function () {
      $modalInstance.close('close');
    };

    // Cancel button handler
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

  };

  // Plug controller function into AngularJS
  angular.module('dimsDashboard.controllers').
  controller('SettingsCtrl',
      ['$scope', '$modalInstance', '$location', '$log', 'SettingsService',
      SettingsCtrl]);

}());







