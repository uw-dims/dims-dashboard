'use strict';
angular.module('dimsDashboard.controllers').
  controller('AnonCtrl', ['$scope', 'Utils', 'FileService', '$http', 'DateService', '$location', '$routeParams', 
    function ($scope, Utils, FileService, $http, DateService, $location, $routeParams) {
    console.log("In crosscor controller");

    // Set up form data
    $scope.formData = {};
    $scope.outputTypes = [{
      value: 'json',
      label: 'JSON'
    },{
      value: 'text',
      label: 'TEXT'
    }];
    $scope.formData.outputType = $scope.outputTypes[0].value;

    // Set up file pickers
    $scope.fileNames = [];
    $scope.mapNames = [];
    $scope.showFiles = false;
    $scope.showMaps = false;

    FileService.getFileList('data_files').then(function(result) {
      console.log(result);
        $scope.fileNames = result.fileNames;
        $scope.filePath = result.filePath;
        $scope.showFiles = true;
    });

    FileService.getFileList('map_files').then(function(result) {
      console.log(result);
        $scope.mapNames = result.fileNames;
        $scope.mapPath = result.filePath;
        $scope.showMaps = true;
    });
    

    // Other setup
    $scope.showResults = false;
    $scope.showJsonResults = false;
    $scope.data = null;
    $scope.resultsMsg = 'Results';

    /**
     *  callClient function
     */
    $scope.callClient = function() {

      console.log($scope.formData);
      // Initialize/reset when calling a client
      $scope.showResults = false;
      $scope.showJsonResults = false;
      $scope.showFormError = false;
      $scope.formErrorMsg = '';

      // Catch some input errors
      if (!Utils.inputPresent($scope.formData.fileName.name)) {
        $scope.showFormError = true;
        $scope.formErrorMsg = 'You have to choose a file to anonymize.';
        return;
      }

      // Setup the config to send to the server
      var clientConfig = {};
     
      Utils.setConfig(clientConfig, $scope.formData.stats, 'stats');
      Utils.setConfig(clientConfig, $scope.formData.outputType, 'outputType');
      if (Utils.inputPresent($scope.formData.mapName)) {
        Utils.setConfig(clientConfig, $scope.mapPath+$scope.formData.mapName.name, 'mapName');
      }
      if (Utils.inputPresent($scope.formData.fileName)) {
        Utils.setConfig(clientConfig, $scope.filePath+$scope.formData.fileName.name, 'fileName');
      }

      console.log(clientConfig);
      console.log("Now sending http get request");

      $scope.resultsMsg = 'Results - Waiting...';
      
      $http(
        { method: 'GET',
          url: '/anon', 
          params: clientConfig
        } ).
        success(function(data, status, headers, config) {
          console.log('anon returned data');
          console.log(status);
          $scope.rawData = data.data;
          $scope.pid = data.pid;
          console.log($scope.rawData);
          console.log($scope.pid);
         
          $scope.showResults = true;

          $scope.resultsMsg = 'Results'; 
          if ($scope.formData.outputType === 'json') {
            $scope.showJsonResults = true;
          }        
          
        }).
        error(function(data, status, headers, config) {
          console.log('rwfind Error');
          console.log(data);
          console.log(status);
          $scope.showFormError = true;
          $scope.formErrorMsg = 'Your request did not get a result. Status: '+status;
          $scope.resultsMsg = 'Results';
          $scope.showResults = false;
        });
      }
}]);
