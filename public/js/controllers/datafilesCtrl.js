angular.module('dimsDemo.controllers').
  controller('DataFilesCtrl', function (fileSourceMap, Utils, $scope, $http, $location, $routeParams) {

    // Setup form data
    $scope.formData = {};
    $scope.showData = false;
    $scope.showFiles = false;
    $scope.sourceMap = fileSourceMap;
    $scope.formData.source = $scope.sourceMap[0].value;

    console.log('source is ' + $scope.formData.source);
    console.log('map is');
    console.log($scope.sourcesMap);

    // Set up ng-grid
    $scope.gridData = {};
    var columnDefs = [
      {field: 'name', displayName: 'Name', enableCellEdit: false},
      {field: 'type', displayName: 'Type', enableCellEdit: true},
      {field: 'desc', displayName: 'Description', enableCellEdit: true}
    ]
    $scope.fileSelections = [];
    $scope.gridOptions = {data: 'gridData', 
        columnDefs: columnDefs,
        selectedItems: $scope.fileSelections,
        multiSelect: false, 
        enableCellEdit: true,
        afterSelectionChange: function(rowitem, event){
          console.log("afterselectionchange, rowitem is");
          console.log(rowitem);
          console.log($scope.fileSelections);
          // if ($scope.fileSelections[0] !== undefined)
          $scope.tableClicked(rowitem.entity.name);
        }};
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
          $scope.showFiles = true;
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
          $scope.isJson = (data instanceof Object);
          console.log("is Json? " + $scope.isJson);

        }).
        error(function(data, status, headers, config) {
          console.log("Error getting file contents");
          console.log(data);
          console.log(status);
        });
    };

  });