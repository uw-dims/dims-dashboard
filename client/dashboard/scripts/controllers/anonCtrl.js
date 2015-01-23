'use strict';
angular.module('dimsDashboard.controllers').
  controller('AnonCtrl', ['$scope', 'Utils', 'FileService', '$http', 'DateService', '$log','SettingsService', 'AnonService', '$location', '$routeParams', 
    function ($scope, Utils, FileService, $http, DateService, $log, SettingsService, AnonService, $location, $routeParams) {

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
    $scope.showFiles = true;
    $scope.showMaps = true;

    // FileService.getFileList('data_files').then(function(result) {
    //     $scope.fileNames = result.fileNames;
    //     $scope.filePath = result.filePath;
    //     $scope.showFiles = true;
    // });

    // FileService.getFileList('map_files').then(function(result) {
    //     $scope.mapNames = result.fileNames;
    //     $scope.mapPath = result.filePath;
    //     $scope.showMaps = true;
    // });

    $scope.settings = SettingsService.get();

    // Other setup
    $scope.showResults = false;
    $scope.showJsonResults = false;
    $scope.data = null;
    $scope.resultsMsg = 'Results';

    /**
     *  Setup up parameters and make the HTTP request
     */
    $scope.callClient = function() {

      console.log($scope.formData);
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
        } ).
        success(function(data, status, headers, config) {
          $log.debug('AnonCtrl.callClient. HTTP success callback. Status: ', status);
          $log.debug('AnonCtrl.callClient. HTTP success callback. Data: ', data);
          $scope.rawData = data;         
          $scope.showResults = true;

          $scope.resultsMsg = 'Results'; 
          if ($scope.formData.outputType === 'json') {
            $scope.showJsonResults = true;
          }        
          
        }).
        error(function(data, status, headers, config) {
          $log.debug('AnonCtrl.callClient. HTTP error callback. Data: ', data, 'Status: ', status);
          $scope.showFormError = true;
          $scope.formErrorMsg = 'Your request did not get a result. Status: '+status;
          $scope.resultsMsg = 'Results';
          $scope.showResults = false;
        });
      };
}]);
