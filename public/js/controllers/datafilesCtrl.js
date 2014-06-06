angular.module('dimsDemo.controllers').
  controller('DataFilesCtrl', function ($scope, $http, $location, $routeParams) {
    // write Ctrl here
    console.log("In DataFilesController");
    // Setup form data
    $scope.formData = {};
    $scope.showData = false;
    $scope.sources = ['ip_lists', 'map_files', 'data_files', 'default_data'];
    $scope.formData.source = $scope.sources[0];

    $scope.gridData = {};
    $scope.gridOptions = {data: 'gridData'};
    $scope.files=[];
    $scope.singleFile="";

    $scope.getFiles = function() {
      console.log("In getFiles");
     return $http({
        method: 'GET',
        url: '/files', 
        params: {
          source: $scope.formData.source,
          action: 'list'
        }
        
      }).
        success(function(data, status, headers, config) {
          console.log("files was called successfully");
          console.log(data);
          console.log(status);
          console.log(config);

          $scope.files = data.result;
          $scope.filePath = data.path;
          $scope.fileSource = config.params.source;

        }).
        error(function(data, status, headers, config) {
          console.log("files Error");
          console.log(data);
          console.log(status);
        });
    }

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
          console.log(status);
          $scope.showData = true;
        }).
        error(function(data, status, headers, config) {
          console.log("files Error");
          console.log(data);
          console.log(status);
        });
    };

  });