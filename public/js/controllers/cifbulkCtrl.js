angular.module('dimsDemo.controllers').
  controller('CifbulkCtrl', function ($scope, Utils, $http, DateService, $location, $routeParams) {
    console.log("In cifbulk controller");

    // Set up form data
    $scope.formData = {};

    // Set up file picker
    $scope.fileNames = [];
    $scope.showFiles = false;
    $scope.getFiles = function(action,source,fileNames,filePath,showFiles) {
      return $http ({
        method: 'GET',
        url: '/files',
        params: {
          source: source,
          action: action 
        }
      }).success(function(data,status,headers,config){
        fileNames = data.result;
        filePath = data.path;
        showFiles = true;
      }).
        error(function(data,status,headers,config) {
          showFiles = false;
        })
    };
    $scope.getFiles('list','ip_lists', $scope.fileNames, $scope.filePath, $scope.showFiles);

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

    var demoJson = {
    "iff": "foe", 
    "program": "cifbulk", 
    "results": [
        {
            "results": [
                {
                    "address": "1.93.24.12/32", 
                    "alternativeid": "http://www.spamhaus.org/query/bl?ip=1.93.24.12", 
                    "asn": "17964", 
                    "asn_desc": "DXTNET Beijing Dian-Xin-Tong Network Technologies Co., Ltd.", 
                    "cc": "CN", 
                    "confidence": "95", 
                    "created": "1391354659", 
                    "description": "direct ube sources, spam operations & spam services", 
                    "detecttime": "1391299200", 
                    "id": "3511366", 
                    "severity": "medium", 
                    "subnet_end": "22878220", 
                    "subnet_start": "22878220", 
                    "weight": "1502"
                }, 
                {
                    "address": "1.93.24.12/32", 
                    "alternativeid": "http://www.spamhaus.org/query/bl?ip=1.93.24.12", 
                    "asn": "17964", 
                    "asn_desc": "DXTNET Beijing Dian-Xin-Tong Network Technologies Co., Ltd.", 
                    "cc": "CN", 
                    "confidence": "85", 
                    "created": "1391354660", 
                    "description": "direct ube sources, spam operations & spam services", 
                    "detecttime": "1391299200", 
                    "id": "3511371", 
                    "severity": "medium", 
                    "subnet_end": "22878220", 
                    "subnet_start": "22878220", 
                    "weight": "1502"
                }], 
            "searchitem": "1.93.24.12"
        }, 
        {
            "results": [
                {
                    "address": "1.93.24.19/32", 
                    "alternativeid": "http://www.spamhaus.org/query/bl?ip=1.93.24.19", 
                    "asn": "17964", 
                    "asn_desc": "DXTNET Beijing Dian-Xin-Tong Network Technologies Co., Ltd.", 
                    "cc": "CN", 
                    "confidence": "95", 
                    "created": "1391354938", 
                    "description": "direct ube sources, spam operations & spam services", 
                    "detecttime": "1391299200", 
                    "id": "3512806", 
                    "severity": "medium", 
                    "subnet_end": "22878227", 
                    "subnet_start": "22878227", 
                    "weight": "1502"
                }, 
                {
                    "address": "1.93.24.19/32", 
                    "alternativeid": "http://www.spamhaus.org/query/bl?ip=1.93.24.19", 
                    "asn": "17964", 
                    "asn_desc": "DXTNET Beijing Dian-Xin-Tong Network Technologies Co., Ltd.", 
                    "cc": "CN", 
                    "confidence": "85", 
                    "created": "1391354938", 
                    "description": "direct ube sources, spam operations & spam services", 
                    "detecttime": "1391299200", 
                    "id": "3512807", 
                    "severity": "medium", 
                    "subnet_end": "22878227", 
                    "subnet_start": "22878227", 
                    "weight": "1502"
                }], 
            "searchitem": "1.93.24.19"
        } ], 
    "time": 1397151933.373606
    };
    // Setup grid
    $scope.cifData = [];
    $scope.columnDefs =  [
          {field: 'address', displayName: 'CIDR'},
          {field: 'alternativeid', displayName: 'Alt ID'},
          {field: 'asn', displayName: 'ASN'},
          {field: 'asn_desc', displayName: 'ASN Description'},
          {field: 'cc', displayName: 'CC'},
          {field: 'confidence', displayName: 'Confidence'},
          {field: 'created', displayName: 'Date Created'},
          {field: 'description', displayName: 'Description'},
          {field: 'detecttime', displayName: 'Detection Time'},
          {field: 'id', displayName: 'ID'},
          {field: 'severity', displayName: 'Severity'},
          {field: 'subnet_start', displayName: 'Subnet Start'},
          {field: 'subnet_end', displayName: 'Subnet End'},
          {field: 'weight', displayName: 'Weight'}
        ];

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
      if (Utils.inputPresent($scope.formData.fileName)) {
        Utils.setConfig(clientConfig, $scope.filePath+$scope.formData.fileName, 'fileName');
      }
    

      console.log(clientConfig);
      console.log("Now sending http get request");

      $scope.resultsMsg = 'Results - Waiting...';
      
      $http(
        { method: 'GET',
          url: '/cifbulk', 
          params: clientConfig
        } ).
        success(function(data, status, headers, config) {
          console.log("cifbulk returned data");
          console.log(status);
          // var flowsFound = -1;
          //  if ($scope.formData.outputType == 'json') {
          //     $scope.result = data;
          //     flowsFound = $scope.result.flows_found;
          //     if (flowsFound > 0) {
          //       $scope.flows = $scope.result.flows;
          //       $scope.flowStats = $scope.result.flow_stats;
          //       // Massage flow_stats data so it can be displayed. TODO: Remove % returned by client
          //       for (var i=0; i< $scope.flowStats.length; i++ ) {
          //         for (key in $scope.flowStats[i]) {
          //           if($scope.flowStats[i].hasOwnProperty(key)) {
          //           var newKey = key;
          //             if (key == '%_of_total') {
          //                newKey = 'Percent_of_total';
          //             } else if (key == 'cumul_%') {
          //                newKey = 'Cumulative_Percent';
          //             }
          //             if (key !== newKey) {
          //                $scope.flowStats[i][newKey] = $scope.flowStats[i][key];
          //                delete($scope.flowStats[i][key]);
          //             }
          //           }
          //         }
          //       }                 
          //       $scope.showJsonResults = true;
          //     }          
             
          // } else {
          //     $scope.result = data;
          // }
         
          $scope.showResults = true;
          $scope.resultsMsg = 'Results';         
          
        }).
        error(function(data, status, headers, config) {
          console.log("cifbulk Error");
          console.log(data);
          console.log(status);
          $scope.showFormError = true;
          $scope.formErrorMsg = 'Your request did not get a result. Status: '+status;
          $scope.resultsMsg = 'Results';
          $scope.showResults = false;
        });
      }
});
