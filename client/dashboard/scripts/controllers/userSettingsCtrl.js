/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

'use strict';

// File: client/dashboard/scripts/controllers/userSettingsCtrl.js

(function () {

  function UserSettingsCtrl($scope, $rootScope, $location, $log, SettingsService) {

    var vm = this;

    // Setup form
    // TODO: need to put this data in config and update with
    // current values (no demo queue). Maybe just specify
    // whether or not a test queue is to be used for all queues
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
    // vm.settings = SettingsService.get();
    vm.settingsFormData = SettingsService.get();


    // Save user settings currently selected by User
    vm.setUserSettings = function () {
      // Construct the config. First copy the original
      // settings. There are other settings that exist that are not
      // changed by this controller - don't want to lose them.
      var settings = _.extend({}, SettingsService.get());
      // Apply formData
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

  }

  // Plug controller function into AngularJS
  angular.module('dimsDashboard.controllers').
  controller('UserSettingsCtrl', UserSettingsCtrl);

  UserSettingsCtrl.$inject = ['$scope', '$rootScope', '$location', '$log', 'SettingsService'];

}());







