angular.module('dimsDemo.controllers').
  controller('CrosscorCtrl', function ($scope, Utils, FileService, $http, DateService, $location, $routeParams) {
    console.log("In crosscor controller");

    // Set up form data
    $scope.formData = {};
    $scope.iffs = [{
      value: 'friend',
      label: 'Friend'
    },{
      value: 'foe',
      label: 'Foe'
    }];
    $scope.formData.iff = $scope.iffs[0].value;

    // Set up file picker
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
    $scope.data = null;
    $scope.resultsMsg = 'Results';

    // Setup grid
    // $scope.matching = [];
    // $scope.matchGridOptions = { data: 'matching',
    //     columnDefs: [{field: 'ip4', displayName: 'IP Address'},
    //       {field: 'site', displayName: 'site'}
    //     ]};
    // $scope.nonMatching = [];
    // $scope.nonMatchingGridOptions = { data: 'nonMatching' ,
    //    columnDefs: [{field: 'ip4', displayName: 'IP Address'},
    //       {field: 'site', displayName: 'site'}
    //     ]};
    // $scope.stats = [];
    // $scope.statsGridOptions = { data: 'nonMatching' ,
    //    columnDefs: [{field: 'site', displayName: 'Site'},
    //       {field: 'count', displayName: 'Count'},
    //       {field: 'percent', displayName:'Percent'}
    //     ]};
    

    /**
     *  callClient function
     */
    $scope.callClient = function() {

      console.log($scope.formData);
      // Initialize/reset when calling a client
      $scope.showResults = false;
      $scope.showFormError = false;
      $scope.formErrorMsg = "";

      // Catch some input errors
      if (!Utils.inputPresent($scope.formData.fileName)) {
        $scope.showFormError = true;
        $scope.formErrorMsg = 'You have to choose a file to correlate.';
        return;
      }

      // Setup the config to send to the server
      var clientConfig = {};
     
      Utils.setConfig(clientConfig, $scope.formData.stats, 'stats');
      Utils.setConfig(clientConfig, $scope.formData.iff, 'iff');
      if (Utils.inputPresent($scope.formData.mapName)) {
        Utils.setConfig(clientConfig, $scope.mapPath+$scope.formData.mapName, 'mapName');
      }
      if (Utils.inputPresent($scope.formData.fileName)) {
        Utils.setConfig(clientConfig, $scope.filePath+$scope.formData.fileName, 'fileName');
      }

      console.log(clientConfig);
      console.log("Now sending http get request");

      $scope.resultsMsg = 'Results - Waiting...';
      
      $http(
        { method: 'GET',
          url: '/crosscor', 
          params: clientConfig
        } ).
        success(function(data, status, headers, config) {
          console.log("crosscor returned data");
          console.log(status);
          console.log(data);
          $scope.data = data;
         
          $scope.showResults = true;
          $scope.resultsMsg = 'Results';         
          
        }).
        error(function(data, status, headers, config) {
          console.log("rwfind Error");
          console.log(data);
          console.log(status);
          $scope.showFormError = true;
          $scope.formErrorMsg = 'Your request did not get a result. Status: '+status;
          $scope.resultsMsg = 'Results';
          $scope.showResults = false;
        });
      }
});
