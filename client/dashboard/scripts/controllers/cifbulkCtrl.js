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
    console.log('In cifbulk controller');

    // Set up form data
    $scope.formData = {};

    // Set up file pickers
    $scope.fileNames = [];
    $scope.showFiles = true;
    $scope.demoNames = [];
    $scope.showDemoFiles = false;

    // FileService.getFileList('ip_lists').then(function(result) {
    //   $scope.fileNames = result.fileNames;
    //   $scope.filePath = result.filePath;
    //   $scope.showFiles = true;
    // });

    // FileService.getDemoList('cifbulk').then(function(result) {
    //   $scope.demoPath = result.filePath;
    //   $scope.demoNames = result.fileNames;
    //   $scope.showDemoFiles = true;
    // });

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

    // Set up ng-grid - currently this has been superseded but may be used later
    // $scope.columnDefs =  [
    //       {field: 'address', displayName: 'CIDR'},
    //       {field: 'alternativeid', displayName: 'Alt ID'},
    //       {field: 'asn', displayName: 'ASN'},
    //       {field: 'asn_desc', displayName: 'ASN Description'},
    //       {field: 'cc', displayName: 'CC'},
    //       {field: 'confidence', displayName: 'Confidence'},
    //       {field: 'created', displayName: 'Date Created'},
    //       {field: 'description', displayName: 'Description'},
    //       {field: 'detecttime', displayName: 'Detection Time'},
    //       {field: 'id', displayName: 'ID'},
    //       {field: 'severity', displayName: 'Severity'},
    //       {field: 'subnet_start', displayName: 'Subnet Start'},
    //       {field: 'subnet_end', displayName: 'Subnet End'},
    //       {field: 'weight', displayName: 'Weight'}
    //     ];


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

    // var getDemo = function(file) {
    //   $scope.showResults = false;
    //   $scope.data = {};
    //   return $http({
    //     method: 'GET',
    //     url: '/files',
    //     params: {
    //       action: 'read',
    //       file: file,
    //       source: 'default_data'
    //     }

    //   // }).success(function(data, status, headers, config) {
    //   //   var serverData = {};
    //   //   serverData.data = data;
    //   //   prepareData(serverData, status, headers, config);
    //   //   } )
    //     }).success(function(data, status, headers, config) {
    //         var fileData = {};
    //         // fileData.data = data;
    //         // fileData.status = status;
    //         prepareData(data,status,headers,config)
    //       })
    //     .error(function(data, status, headers, config) {
    //       console.log(data);
    //       console.log(status);
    //     });
    // };

    /**
     *  callClient function
     */
    $scope.callClient = function() {

      console.log($scope.formData);

      // Initialize/reset when calling a client
      $scope.showResults = false;
      $scope.showFormError = false;
      $scope.formErrorMsg = '';

      // User wants demo data - get data and return - TODO remove
      // if ($scope.formData.demoName !== null && $scope.formData.demoName !== undefined) {
      //   $scope.resultsMsg = 'Results - Waiting...';
      //   getDemo($scope.formData.demoName);
      //   return;
      // }

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

      // if ((!Utils.inputPresent($scope.formData.startDate) && Utils.inputPresent($scope.formData.startHour)) ||
      //  (!Utils.inputPresent($scope.formData.endDate) && Utils.inputPresent($scope.formData.endHour))) {
      //   $scope.showFormError = true;
      //   $scope.formErrorMsg = 'If you enter a value for the hour, also enter a value for the date.';
      //   return;
      // }

      // Setup the config to send to the server
      var clientConfig = {};
      // var startTime = (Utils.inputPresent($scope.formData.startDate)) ? $scope.formData.startDate.getTime()/1000 : null;
      // var endTime = (Utils.inputPresent($scope.formData.endDate)) ? $scope.formData.endDate.getTime()/1000 : null;
      // startTime = (Utils.inputPresent($scope.formData.startHour)) ? startTime + $scope.formData.startHour*60*60 : startTime;
      // endTime = (Utils.inputPresent($scope.formData.endHour)) ? endTime + $scope.formData.endHour*60*60 : endTime;
      // Utils.setConfig(clientConfig, startTime, 'startTime');
      // Utils.setConfig(clientConfig, endTime, 'endTime');
      // Utils.setConfig(clientConfig, $scope.formData.numDays, 'numDays');
      Utils.setConfig(clientConfig, $scope.formData.ips, 'ips');
      // Utils.setConfig(clientConfig, $scope.formData.stats, 'stats');
      // Utils.setConfig(clientConfig, $scope.formData.header, 'header');
      Utils.setConfig(clientConfig, $scope.formData.rpcVerbose, 'verbose');
      Utils.setConfig(clientConfig, $scope.formData.rpcDebug, 'debug');
      Utils.setConfig(clientConfig, $scope.formData.cifbulkQueue, 'queue');
      Utils.setConfig(clientConfig, $scope.formData.anonymize, 'anonymize');
      Utils.setConfig(clientConfig, $scope.formData.fileName, 'fileName');


      console.log(clientConfig);
      console.log('Now sending http get request');

      $scope.resultsMsg = 'Results - Waiting...';

      $http(
        { method: 'GET',
          url: '/cifbulk',
          params: clientConfig
        } )

        .success(prepareData)

        .error(function(data, status, headers, config) {
          console.log('cifbulk Error');
          console.log(data);
          console.log(status);
          $scope.showFormError = true;
          $scope.formErrorMsg = 'Your request did not get a result. Status: '+status;
          $scope.resultsMsg = 'Results';
          $scope.showResults = false;
        });
      };
}]);
