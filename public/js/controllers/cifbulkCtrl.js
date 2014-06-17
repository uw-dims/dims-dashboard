angular.module('dimsDemo.controllers').
  controller('CifbulkCtrl', function ($scope, Utils, FileService, $http, DateService, $location, $routeParams) {
    console.log("In cifbulk controller");

    // Set up form data
    $scope.formData = {};

    // Set up file pickers
    $scope.fileNames = [];
    $scope.showFiles = false;
    $scope.demoNames = [];
    $scope.showDemoFiles = false;

    FileService.getFileList('ip_lists').then(function(result) {
      console.log(result);
      $scope.fileNames = result.fileNames;
      $scope.filePath = result.filePath;
      $scope.showFiles = true;
    });

    FileService.getDemoList('cifbulk').then(function(result) {
      console.log(result);
      $scope.demoPath = result.filePath;
      $scope.demoNames = result.fileNames;
      $scope.showDemoFiles = true;
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
    $scope.data = [];
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

    var prepareData = function(data, status, headers, config) {
      console.log(data);
      $scope.data = data;
      $scope.showResults = true;
      for (var i=0; i < $scope.data.results.length; i++) {
        for (var j=0; j < $scope.data.results[i].results.length; j++) {
          var detectDate = new Date($scope.data.results[i].results[j].detecttime*1000);
          var createdDate = new Date($scope.data.results[i].results[j].created*1000);
          $scope.data.results[i].results[j].detecttime = detectDate;
          $scope.data.results[i].results[j].created = createdDate;
        }
      }
    };

    $scope.getDemo = function() {
      $scope.showResults = false;
      return $http({
        method: 'GET',
        url: '/files',
        params: {
          action: 'read',
          file: 'cifbulk_results.txt',
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
      Utils.setConfig(clientConfig, $scope.formData.header, 'header');
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
        } )

        .success(prepareData)

        .error(function(data, status, headers, config) {
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
