angular.module('dimsDemo.controllers').
  controller('RwfindCtrl', function ($scope, Utils, $http, DateService, $location, $routeParams) {
    console.log("In rwfind controller");

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

    // Set up file picker
    $scope.source = 'ip_lists';
    $scope.action = 'list';
    $scope.fileNames = [];
    $scope.showFiles = false;
    $scope.getFiles = function() {
      return $http ({
        method: 'GET',
        url: '/files',
        params: {
          source: $scope.source,
          action: $scope.action = 'list' 
        }
      }).success(function(data,status,headers,config){
        $scope.fileNames = data.result;
        $scope.filePath = data.path;
        $scope.showFiles = true;
      }).
        error(function(data,status,headers,config) {
          $scope.showFiles = false;
        })
    };
    $scope.getFiles();

    // Setup date
    $scope.dateConfig = DateService.dateConfig;

    $scope.open = function($event, datePicker) {
      var result = DateService.open($event, datePicker);
      $scope.dateConfig.startOpened = result[0];
      $scope.dateConfig.endOpened = result[1];
    };

    // Other setup
    $scope.showResults = false;
    $scope.showJsonResults = false;
    $scope.result = null;
    $scope.resultsMsg = 'Results';

    // Setup grid
    $scope.flows = [];
    $scope.dateTemplate = '<div class="ngCellText colt{{$index}}">{{row.getProperty(col.field) | date : "MM-dd-yyyy HH Z"}}</div>'
    $scope.flowGridOptions = { data: 'flows',
        columnDefs: [{field: 'sIP', displayName: 'Source IP', width:"auto"},
          {field: 'sIP', displayName: 'Source IP', width:"auto"},
          {field: 'dIP', displayName: 'Destination IP',width:"auto"},
          {field: 'sPort', displayName: 'Source Port', width:"auto"},
          {field: 'dPort', displayName: 'Destination Port', width:"auto"},
          {field: 'pro', displayName: 'Protocol', width:"auto"},
          {field: 'packets', displayName: 'Packets', width:"auto"},
          {field: 'bytes', displayName: 'Bytes', width:"auto"},
          {field: 'flags', displayName: 'Flags', width:"auto"},
          {field: 'sTime', displayName: 'Start Time', width:"auto"},
          {field: 'duration', displayName: 'Duration', width:"auto"}
        ]};
    $scope.flowStats = [];
    $scope.flowStatsGridOptions = { data: 'flowStats' };
    

    /**
     *  callClient function
     */
    $scope.callClient = function() {

      console.log($scope.formData);
      // Initialize/reset when calling a client
      $scope.showResults = false;
      $scope.showFormError = false;
      $scope.showJsonResults = false;
      $scope.formErrorMsg = "";

      // Catch some input errors
      if (!Utils.inputPresent($scope.formData.ips) && !Utils.inputPresent($scope.formData.fileName)) {
        $scope.showFormError = true;
        $scope.formErrorMsg = 'You have to either choose a file or enter the ips/CIDR/domains to search for.';
        return;
      }
      if (Utils.inputPresent($scope.formData.ips) && Utils.inputPresent($scope.formData.fileName)) {
        $scope.showFormError = true;
        $scope.formErrorMsg = 'You have to either choose a file or enter the ips/CIDR/domains to search for. You cannot do both';
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
      Utils.setConfig(clientConfig, $scope.formData.outputType, 'outputType');
      Utils.setConfig(clientConfig, $scope.formData.numDays, 'numDays');
      Utils.setConfig(clientConfig, $scope.formData.hitLimit, 'hitLimit');
      Utils.setConfig(clientConfig, $scope.formData.ips, 'ips');
      Utils.setConfig(clientConfig, $scope.formData.header, 'header');
      if (Utils.inputPresent($scope.formData.fileName)) {
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
           if ($scope.formData.outputType == 'json') {
              $scope.result = data;
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
             
          } else {
              $scope.result = data;
          }
         
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
