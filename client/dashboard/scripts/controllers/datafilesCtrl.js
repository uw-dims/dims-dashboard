'use strict';
angular.module('dimsDashboard.controllers').
  controller('DataFilesCtrl', ['fileSourceMap', 'Utils', '$scope', '$http', '$log', '$location', '$routeParams', 'SettingsService',
      function (fileSourceMap, Utils, $scope, $http, $log, $location, $routeParams, SettingsService) {
    console.log('In DataFiles controller');
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

    $scope.singleFile='';

    $scope.getFiles = function() {
      return $http({
        method: 'GET',
        url: '/files', 
        params: {
          source: $scope.formData.source,
          action: 'list'
        }       
      }).
        success(function(data, status, headers, config) {
          $scope.gridData = data.result;
          $scope.filePath = data.path;
          $scope.fileSource = config.params.source;
          $scope.showFiles = true;
        }).
        error(function(data, status, headers, config) {
          console.log('Error getting file list');
          console.log(data);
          console.log(status);
        });
    };

    // Display file contents when clicked
    $scope.tableClicked = function(file) {
      $scope.showData = false;
      $scope.singleFile = '';
      $scope.rawFile = '';
      $scope.loading = true;
      $scope.prettyMsg = '';
      var maxFileSize = 1000000;

      return $http({
        method: 'GET',
        // Modify transformResponse since we don't want automatic Json parsing
        transformResponse: [function(data, headersGetter) {
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
        success(function(data, status, headers, config){
          $scope.showData = true;
          $scope.loading = false;
          $scope.isRaw = true;
          $scope.singleFile = data;
          $scope.isJson = isJson(data);
        }).
        error(function(data, status, headers, config) {
          $scope.loading = false;
          console.log('Error getting file contents');
          console.log(data);
          console.log(status);
        });
    };

    var isJson = function(data) {
      $scope.jsonData = '';
      try {
        $scope.jsonData = JSON.parse($scope.singleFile);
        return true;
      } catch(e) {
        return false;
      }
    };

    $scope.showPrettyResults= function() {
      $scope.prettyMsg = '';
      try {
        var jsonPretty = JSON.stringify($scope.jsonData,null,2);
        $scope.$evalAsync($scope.fileContentsLoaded(jsonPretty));
      } catch(e) {
        $scope.prettyMsg = 'Pretty print does not work on this data.';
      }
    };

    $scope.fileContentsLoaded = function(jsonPretty) {
      $scope.rawFile = $scope.singleFile;
      $scope.singleFile = jsonPretty;
      $scope.isRaw = false;
    };

    $scope.showRawData = function() {
        $scope.singleFile = $scope.rawFile;
        $scope.rawFile = '';
        $scope.isRaw = true;
    };
  }]);