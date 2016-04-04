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
angular.module('dimsDashboard.controllers').
  controller('AnonCtrl', ['$scope', 'Utils', 'FileService', '$http', 'DateService', '$log', 'SettingsService',
    function ($scope, Utils, FileService, $http, DateService, $log, SettingsService) {

      // Set up form data
      $scope.formData = {};
      $scope.outputTypes = [{
        value: 'json',
        label: 'JSON'
      }, {
        value: 'text',
        label: 'TEXT'
      }];
      $scope.formData.outputType = $scope.outputTypes[0].value;

      // Set up file pickers
      $scope.fileNames = [];
      $scope.mapNames = [];
      $scope.showFiles = true;
      $scope.showMaps = true;

      $scope.settings = SettingsService.get();

      // Other setup
      $scope.showResults = false;
      $scope.showJsonResults = false;
      $scope.data = null;
      $scope.resultsMsg = 'Results';

      /**
       *  Setup up parameters and make the HTTP request
       */
      $scope.callClient = function () {

        // Initialize/reset when calling a client
        $scope.showResults = false;
        $scope.showJsonResults = false;
        $scope.showFormError = false;
        $scope.formErrorMsg = '';

        // Catch some input errors
        if (!Utils.inputPresent($scope.formData.fileName)) {
          $scope.showFormError = true;
          $scope.formErrorMsg = 'You have to choose a file to anonymize.';
          return;
        }

        // Setup the config to send to the server
        var clientConfig = {};

        Utils.setConfig(clientConfig, $scope.formData.stats, 'stats');
        Utils.setConfig(clientConfig, $scope.formData.outputType, 'outputType');
        Utils.setConfig(clientConfig, $scope.formData.mapName, 'mapName');
        Utils.setConfig(clientConfig, $scope.formData.fileName, 'fileName');
        Utils.setConfig(clientConfig, $scope.settings.rpcVerbose, 'verbose');
        Utils.setConfig(clientConfig, $scope.settings.rpcDebug, 'debug');

        $log.debug('AnonCtrl.callClient. Ready to send request. clientConfig: ', clientConfig);

        $scope.resultsMsg = 'Results - Waiting...';

        $http(
          { method: 'POST',
            url: '/anon',
            params: clientConfig
          }).
          success(function (data, status, headers, config) {
            $log.debug('AnonCtrl.callClient. HTTP success callback. Status: ', status);
            $log.debug('AnonCtrl.callClient. HTTP success callback. Data: ', data);
            $scope.rawData = data;
            $scope.showResults = true;

            $scope.resultsMsg = 'Results';
            if ($scope.formData.outputType === 'json') {
              $scope.showJsonResults = true;
            }

          }).
          error(function (data, status, headers, config) {
            $log.debug('AnonCtrl.callClient. HTTP error callback. Data: ', data, 'Status: ', status);
            $scope.showFormError = true;
            $scope.formErrorMsg = 'Your request did not get a result. Status: ' + status;
            $scope.resultsMsg = 'Results';
            $scope.showResults = false;
          });
      };
    }]);
