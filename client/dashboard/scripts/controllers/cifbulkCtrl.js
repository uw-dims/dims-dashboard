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
  controller('CifbulkCtrl', ['$scope', 'Utils', 'FileService', '$http', '$log', 'DateService', 'SettingsService', 'AnonService', '$location', '$routeParams',
      function ($scope, Utils, FileService, $http, $log, DateService, SettingsService, AnonService, $location, $routeParams) {

  // Set up form data
  $scope.formData = {};

  // Set up file pickers
  $scope.fileNames = [];
  $scope.showFiles = true;
  $scope.demoNames = [];
  $scope.showDemoFiles = false;

  // Get the current user settings
  $scope.settings = SettingsService.get();

  // Setup date
  $scope.dateConfig = DateService.dateConfig;
  $scope.open = function($event, datePicker) {
    var result = DateService.open($event, datePicker);
    $scope.dateConfig.startOpened = result[0];
    $scope.dateConfig.endOpened = result[1];
  };

  // Other setup
  $scope.showResults = false;
  $scope.result = null;
  $scope.resultsMsg = '';
  $scope.rawData = '';
  $scope.data = {};


  // Prepare incoming data
  var prepareData = function(data, status, headers, config) {
    $scope.rawData = data;
    $scope.noResults = [];
    $scope.showResults = true;
    $scope.resultsMsg = 'Results';
    $scope.data = {};
    $scope.data.iff = $scope.rawData.iff;
    $scope.data.program = $scope.rawData.program;
    $scope.data.time = $scope.rawData.time;
    $scope.data.results=[];
    for (var i=0; i < $scope.rawData.results.length; i++) {
      if ($scope.rawData.results[i].results.length === 0) {
        $scope.noResults.push({searchitem: $scope.rawData.results[i].searchitem});
      } else {
        for (var j=0; j < $scope.rawData.results[i].results.length; j++) {
          var detectDate = new Date($scope.rawData.results[i].results[j].detecttime);
          $scope.rawData.results[i].results[j].detecttime = detectDate;
          var reportDate = new Date($scope.rawData.results[i].results[j].reporttime);
          $scope.rawData.results[i].results[j].reporttime = reportDate;
        }
        $scope.data.results.push($scope.rawData.results[i]);
      }
    }
    $log.debug('$scope.data is ', $scope.data);
  };


  /**
   *  callClient function
   */
  $scope.callClient = function() {

    // Initialize/reset when calling a client
    $scope.showResults = false;
    $scope.showFormError = false;
    $scope.formErrorMsg = '';

    // Catch some input errors
    if (!Utils.inputPresent($scope.formData.ips) && !Utils.inputPresent($scope.formData.fileName)) {
      $scope.showFormError = true;
      $scope.formErrorMsg = 'You have to either choose a file or enter ips/CIDR/domains to correlate.';
      return;
    }
    if (Utils.inputPresent($scope.formData.ips) && Utils.inputPresent($scope.formData.fileName)) {
      $scope.showFormError = true;
      $scope.formErrorMsg = 'You have to either choose a file or enter ips/CIDR/domains. You cannot do both';
      return;
    }

    // Setup the config to send to the server
    var clientConfig = {};
   
    Utils.setConfig(clientConfig, $scope.formData.ips, 'ips');
   
    Utils.setConfig(clientConfig, $scope.formData.rpcVerbose, 'verbose');
    Utils.setConfig(clientConfig, $scope.formData.rpcDebug, 'debug');
    Utils.setConfig(clientConfig, $scope.formData.cifbulkQueue, 'queue');
    Utils.setConfig(clientConfig, $scope.formData.anonymize, 'anonymize');
    Utils.setConfig(clientConfig, $scope.formData.fileName, 'fileName');

    $scope.resultsMsg = 'Results - Waiting...';

    $http(
      { method: 'GET',
        url: '/cifbulk',
        params: clientConfig
      } )

      .success(prepareData)

      .error(function(data, status, headers, config) {
        $scope.showFormError = true;
        $scope.formErrorMsg = 'Your request did not get a result. Status: '+status;
        $scope.resultsMsg = 'Results';
        $scope.showResults = false;
      });
    };
}]);
