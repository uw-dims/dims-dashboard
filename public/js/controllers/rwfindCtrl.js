angular.module('dimsDemo.controllers').
  controller('RwfindCtrl', function ($scope, Utils, $http, FileService, DateService, $location, $routeParams) {
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

    // Set up file pickers
    $scope.fileNames = [];
    $scope.showFiles = false;
    $scope.demoNames = [];
    $scope.showDemoFiles = false;

    FileService.getFileList('ip_lists').then(function(result) {
      console.log('result in rwfindCtrl getFileList');
      console.log(result);
        $scope.fileNames = result.fileNames;
        $scope.filePath = result.filePath;
        $scope.showFiles = true;
      console.log('$scope.fileNames in rwfindCtrl getFileList');
      console.log($scope.fileNames);
    });

    FileService.getDemoList('rwfind').then(function(result) {
      console.log('result in rwfindCtrl getDemoList');
      console.log(result);
      $scope.demoPath = result.filePath;
      $scope.demoNames = result.fileNames;
      $scope.showDemoFiles = true;
      console.log('$scope.demoNames in rwfindCtrl getDemoList');
      console.log($scope.demoNames);
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
    $scope.showJsonResults = false;
    $scope.result = null;
    $scope.resultsMsg = 'Results';
    $scope.rawData = "";
    $scope.prettyData = "";
    $scope.dataSize=100;
    $scope.totalDataSize=0;
    $scope.query="";

    // Setup grid
    $scope.flows = [];
    // Set up ng-grid - currently this has been superseded but may be used later
    // $scope.flowGridOptions = { data: 'flows',
    //     columnDefs: [{field: 'sIP', displayName: 'Source IP', width:"**"},
    //       {field: 'dIP', displayName: 'Destination IP',width:"**"},
    //       {field: 'sPort', displayName: 'Source Port', width:"*"},
    //       {field: 'dPort', displayName: 'Destination Port', width:"*"},
    //       {field: 'pro', displayName: 'Protocol', width:"*"},
    //       {field: 'packets', displayName: 'Packets', width:"*"},
    //       {field: 'bytes', displayName: 'Bytes', width:"*"},
    //       {field: 'flags', displayName: 'Flags', width:"*"},
    //       {field: 'sTime', displayName: 'Start Time', width:"**"},
    //       {field: 'dur', displayName: 'Duration', width:"*"}
    //     ]};
    $scope.flowStats = [];
    // $scope.flowStatsGridOptions = { data: 'flowStats' };

    var prepareData = function(data,status,headers,config) {
      console.log("rwfind returned data - in prepareData");
      console.log(status);
      $scope.rawData = data;
      $scope.flowItems=[];
      var flowsFound = -1;
       if ($scope.formData.outputType == 'json') {
          $scope.result = data;
          flowsFound = $scope.result.flows_found;
          if (flowsFound > 0) {
            $scope.flows = $scope.result.flows;
            $scope.flowStats = $scope.result.flow_stats;
            // Massage flow_stats data so it can be displayed. TODO: Remove % returned by client
            if($scope.flowStats) {
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
            }                
            $scope.showJsonResults = true;
            $scope.start = 0;
            $scope.totalDataSize = $scope.flows.length;
            $scope.pageResults();
          }          
         
      } else {
          $scope.result = data;
      }
      console.log("Done processing JSON");
      $scope.showResults = true;
      $scope.resultsMsg = (flowsFound >=0) ? 'Results - ' + flowsFound + ' flows found': 'Results';         
      $scope.isRaw = true;
    };

    $scope.pageResults = function() {
      // console.log("calling pageResults: start is " + $scope.start);
      var end = ($scope.start + $scope.dataSize) > $scope.totalDataSize ? $scope.totalDataSize : $scope.start + $scope.dataSize;
      // var iterationSize = ($scope.start + $scope.dataSize) > size ? size - $scope.start : $scope.dataSize;
      for (var i=$scope.start; i<end; i++ ){
        $scope.flowItems.push($scope.flows[i]);
      }
      $scope.start = end;
    }

    var getDemo = function(file) {
      console.log("in getDemo");
      $scope.showResults = false;
      $scope.showJsonResults = false;
      $scope.data = {};
      return $http({
        method: 'GET',
        url: '/files',
        params: {
          action: 'read',
          file: file,
          source: 'default_data'
        }

      }).success(prepareData)
        .error(function(data, status, headers, config) {
          console.log(data);
          console.log(status);
        });
    }
    

    /**
     *  callClient function
     */
    $scope.callClient = function() {
      console.log("in callClient");
      console.log($scope.formData);
      // Initialize/reset when calling a client
      $scope.showResults = false;
      $scope.showFormError = false;
      $scope.showJsonResults = false;
      $scope.formErrorMsg = "";

      // User wants demo data - get data and return
      if ($scope.formData.demoName !== null && $scope.formData.demoName !== undefined) {
        console.log("looking for demo data");
        console.log($scope.formData.demoName);
        $scope.resultsMsg = 'Results - Waiting...';
        getDemo($scope.formData.demoName);
        return;
      }

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
        Utils.setConfig(clientConfig, $scope.filePath+$scope.formData.fileName.name, 'fileName');
      }

      console.log(clientConfig);
      console.log("Now sending http get request");

      $scope.resultsMsg = 'Results - Waiting...';
      
      $http(
        { method: 'GET',
          url: '/rwfind', 
          params: clientConfig
        } ).
        success(prepareData).
        error(function(data, status, headers, config) {
          console.log("rwfind Error");
          console.log(data);
          console.log(status);
          $scope.showFormError = true;
          $scope.formErrorMsg = 'Your request did not get a result. Status: '+status;
          $scope.resultsMsg = 'Results';
          $scope.showResults = false;
        });
      };

  $scope.showPrettyResults= function() {
    $scope.prettyMsg = "";
    if ($scope.prettyData.length == 0) {
      try {
        $scope.prettyData = JSON.stringify($scope.rawData,null,2);
        $scope.isRaw = false;
      } catch(e) {
        $scope.prettyMsg = "Pretty print does not work on this data."
      }
    }
    $scope.isRaw = false;
    
  };

  $scope.showRawData = function() {
        $scope.isRaw = true;
    };

});
