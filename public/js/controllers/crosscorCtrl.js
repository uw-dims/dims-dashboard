angular.module('dimsDemo.controllers').
  controller('CrosscorCtrl', function ($scope, Utils, FileService, $http, DateService, $location, $routeParams) {
    console.log("In cifbulk controller");

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

    FileService.getFileList('ip_lists').then(function(result) {
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
    $scope.resultsMsg = 'Results';

    // Setup grid
    $scope.matching = [];
    $scope.matchGridOptions = { data: 'matching',
        columnDefs: [{field: 'ip4', displayName: 'IP Address'},
          {field: 'site', displayName: 'site'}
        ]};
    $scope.nonMatching = [];
    $scope.nonMatchingGridOptions = { data: 'nonMatching' ,
       columnDefs: [{field: 'ip4', displayName: 'IP Address'},
          {field: 'site', displayName: 'site'}
        ]};
    $scope.stats = [];
    $scope.statsGridOptions = { data: 'nonMatching' ,
       columnDefs: [{field: 'site', displayName: 'Site'},
          {field: 'count', displayName: 'Count'},
          {field: 'percent', displayName:'Percent'}
        ]};
    

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
      if (!Utils.inputPresent($scope.formData.startDate) && !Utils.inputPresent($scope.formData.endDate) && 
          !Utils.inputPresent($scope.formData.numDays)) {
        $scope.showFormError = true;
        $scope.formErrorMsg = 'Either enter number of days, or enter a start time and (optionally) end time.';
        return;
      }
      if ((!Utils.inputPresent($scope.formData.startDate) && Utils.inputPresent($scope.formData.startHour))
        ||(!Utils.inputPresent($scope.formData.endDate) && Utils.inputPresent($scope.formData.endHour))) {
        $scope.showFormError = true;
        $scope.formErrorMsg = 'If you enter a value for the hour, also enter a value for the date.';
        return;
      }

      // Setup the config to send to the server
      var clientConfig = {};
      var startTime = (Utils.inputPresent($scope.formData.startDate)) ? $scope.formData.startDate.getTime()/1000 : null;
      var endTime = (Utils.inputPresent($scope.formData.endDate)) ? $scope.formData.endDate.getTime()/1000 : null;      
      startTime = (Utils.inputPresent($scope.formData.startHour)) ? startTime + $scope.formData.startHour*60*60 : startTime;
      endTime = (Utils.inputPresent($scope.formData.endHour)) ? endTime + $scope.formData.endHour*60*60 : endTime;
      Utils.setConfig(clientConfig, startTime, 'startTime');
      Utils.setConfig(clientConfig, endTime, 'endTime');
      Utils.setConfig(clientConfig, $scope.formData.ips, 'ips');
      Utils.setConfig(clientConfig, $scope.formData.stats, 'stats');
      Utils.setConfig(clientConfig, $scope.formData.stats, 'header');
      if (Utils.inputPresent($scope.formData.mapName)) {
        Utils.setConfig(clientConfig, $scope.mapPath+$scope.formData.mapName, 'mapName');
      }
      if (Utils.inputPresent($scope.formData.mapFile)) {
        Utils.setConfig(clientConfig, $scope.filePath+$scope.formData.fileName, 'fileName');
      }

      console.log(clientConfig);
      console.log("Now sending http get request");

      $scope.resultsMsg = 'Results - Waiting...';
      
      $http(
        { method: 'GET',
          url: '/rwfind', 
          params: clientConfig
        } ).
        success(function(data, status, headers, config) {
          console.log("rwfind returned data");
          console.log(status);
          var flowsFound = -1;
           if ($scope.formData.outputType == 'json') {
              $scope.result = data;
              flowsFound = $scope.result.flows_found;
              if (flowsFound > 0) {
                $scope.flows = $scope.result.flows;
                $scope.flowStats = $scope.result.flow_stats;
                // Massage flow_stats data so it can be displayed. TODO: Remove % returned by client
                for (var i=0; i< $scope.flowStats.length; i++ ) {
                  for (key in $scope.flowStats[i]) {
                    if($scope.flowStats[i].hasOwnProperty(key)) {
                    var newKey = key;
                      if (key == '%_of_total') {
                         newKey = 'Percent_of_total';
                      } else if (key == 'cumul_%') {
                         newKey = 'Cumulative_Percent';
                      }
                      if (key !== newKey) {
                         $scope.flowStats[i][newKey] = $scope.flowStats[i][key];
                         delete($scope.flowStats[i][key]);
                      }
                    }
                  }
                }                 
                $scope.showJsonResults = true;
              }          
             
          } else {
              $scope.result = data;
          }
         
          $scope.showResults = true;
          $scope.resultsMsg = (flowsFound >=0) ? 'Results - ' + flowsFound + ' flows found': 'Results';         
          
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
