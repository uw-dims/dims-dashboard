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
  controller('DataFilesCtrl', ['fileSourceMap', 'Utils', '$scope', '$http', '$log', '$location', '$routeParams', 'SettingsService',
      function (fileSourceMap, Utils, $scope, $http, $log, $location, $routeParams, SettingsService) {
    $log.debug('In DataFiles controller');
    // Setup form data
    $scope.formData = {};
    $scope.showData = false;
    $scope.showFiles = false;
    $scope.sourceMap = fileSourceMap;
    $scope.formData.source = $scope.sourceMap[0].value;

    $scope.settings = SettingsService.get();

    // Set up ng-grid
    $scope.gridData = {};
    var columnDefs = [
      {field: 'name', displayName: 'Name', enableCellEdit: false,
          cellTemplate: '<div class="ngCellText" ng-click="tableClicked(row.getProperty(col.field))">{{row.getProperty(col.field)}}</div>'},
      {field: 'type', displayName: 'Type', enableCellEdit: true},
      {field: 'desc', displayName: 'Description', enableCellEdit: true}
    ];
    $scope.fileSelections = [];
    $scope.gridOptions = {data: 'gridData',
        columnDefs: columnDefs,
        selectedItems: $scope.fileSelections,
        multiSelect: false,
        enableCellEdit: true
      };

    $scope.singleFile = '';

    $scope.getFiles = function () {
      return $http({
        method: 'GET',
        url: '/files',
        params: {
          source: $scope.formData.source,
          action: 'list'
        }
      }).
        success(function (data, status, headers, config) {
          $scope.gridData = data.files;
          $scope.filePath = data.path;
          $scope.fileSource = config.params.source;
          $scope.showFiles = true;
        }).
        error(function (data, status, headers, config) {
          $log.error('Error getting file list', data, status, config);
        });
    };

    // Display file contents when clicked
    $scope.tableClicked = function (file) {
      $scope.showData = false;
      $scope.singleFile = '';
      $scope.rawFile = '';
      $scope.loading = true;
      $scope.prettyMsg = '';
      var maxFileSize = 1000000;

      return $http({
        method: 'GET',
        // Modify transformResponse since we don't want automatic Json parsing
        transformResponse: [function (data, headersGetter) {
          if (angular.isString(data)) {
            data = data.replace(angular.PROTECTION_PREFIX, '');
          }
          return data;
        }],
        url: '/files',
        // headers: {Accept: "text/plain, */*"},
        // Using truncate param to truncate file if too large
        params: {
          action: 'read',
          truncate: maxFileSize,
          file: file,
          source: $scope.fileSource
        }
      }).
        success(function (data, status, headers, config){
          $scope.showData = true;
          $scope.loading = false;
          $scope.isRaw = true;
          $scope.singleFile = data;
          $scope.isJson = isJson(data);
        }).
        error(function (data, status, headers, config) {
          $scope.loading = false;
          $log.error('Error getting file contents', data, status, config);
        });
    };

    var isJson = function (data) {
      $scope.jsonData = '';
      try {
        $scope.jsonData = JSON.parse($scope.singleFile);
        return true;
      } catch(e) {
        return false;
      }
    };

    $scope.showPrettyResults= function () {
      $scope.prettyMsg = '';
      try {
        var jsonPretty = JSON.stringify($scope.jsonData,null,2);
        $scope.$evalAsync($scope.fileContentsLoaded(jsonPretty));
      } catch(e) {
        $scope.prettyMsg = 'Pretty print does not work on this data.';
      }
    };

    $scope.fileContentsLoaded = function (jsonPretty) {
      $scope.rawFile = $scope.singleFile;
      $scope.singleFile = jsonPretty;
      $scope.isRaw = false;
    };

    $scope.showRawData = function () {
        $scope.singleFile = $scope.rawFile;
        $scope.rawFile = '';
        $scope.isRaw = true;
    };
  }]);
