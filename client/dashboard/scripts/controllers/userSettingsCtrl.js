'use strict';

// File: client/dashboard/scripts/controllers/userSettingsCtrl.js

(function () {

  function UserSettingsCtrl($scope, $rootScope, $location, $log, SettingsService) {

    var vm = this;

    // Setup form
    vm.cifbulkQueueValues = [{
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

    vm.message = '';

    // Get the current settings - save in scope and in formData
    vm.settings = SettingsService.get();
    vm.settingsFormData = SettingsService.get();


    // Save user settings currently selected by User
    vm.setUserSettings = function () {
      // Construct the config
      var settings = {};
      settings.anonymize = vm.settingsFormData.anonymize;
      settings.cifbulkQueue = vm.settingsFormData.cifbulkQueue;
      settings.rpcDebug = vm.settingsFormData.rpcDebug;
      settings.rpcVerbose = vm.settingsFormData.rpcVerbose;

      // Call the service to save the settings
      SettingsService.update(settings).then(function (resource) {
        $log.debug('success setting, data is ', resource.data);
        vm.message = 'Your changes were applied';
      }).catch(function (err) {
        $log.debug('setUserSettings error', err);
      });
    };

    // // OK button handler
    // $scope.ok = function () {
    //   $modalInstance.close('close');
    // };

    // // Cancel button handler
    // $scope.cancel = function () {
    //   $modalInstance.dismiss('cancel');
    // };

  }

  // Plug controller function into AngularJS
  angular.module('dimsDashboard.controllers').
  controller('UserSettingsCtrl', UserSettingsCtrl);

  UserSettingsCtrl.$inject = ['$scope', '$rootScope', '$location', '$log', 'SettingsService'];

}());







