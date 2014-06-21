angular.module('dimsDemo.controllers').
  controller('DataFilesCtrl', function (fileSources, $scope, $http, $location, $routeParams) {

    // Setup form data
    $scope.formData = {};
    $scope.showData = false;
    $scope.sources = fileSources;
    $scope.formData.source = $scope.sources[0];

    // Set up ng-grid
    $scope.gridData = {};
    var columnDefs = [
      {field: 'name', displayName: 'Name'},
      {field: 'type', displayName: 'Type'},
      {field: 'desc', displayName: 'Description'}
    ]
    $scope.fileSelections = [];
    $scope.gridOptions = {data: 'gridData', 
        columnDefs: columnDefs,
        selectedItems: $scope.mySelections,
        multiSelect: false};
    $scope.files=[];
    $scope.singleFile="";

    $scope.getFiles = function() {
      console.log("In getFiles");
      console.log($scope.formData.source);
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
        }).
        error(function(data, status, headers, config) {
          console.log("Error getting file list");
          console.log(data);
          console.log(status);
        });
    }

    // Display file contents when clicked
    $scope.tableClicked = function(file) {
      console.log(file);
      return $http({
        method: 'GET',
        url: '/files',
        params: {
          action: 'read',
          file: file,
          source: $scope.fileSource
        }
      }).
        success(function(data, status, headers, config){
          $scope.singleFile = data;
          $scope.showData = true;
        }).
        error(function(data, status, headers, config) {
          console.log("Error getting file contents");
          console.log(data);
          console.log(status);
        });
    };

  });