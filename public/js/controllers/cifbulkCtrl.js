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
    $scope.rawData = "";

    $scope.data = {};
    // Set up ng-grid - currently this has been superseded but may be used later
    // $scope.columnDefs =  [
    //       {field: 'address', displayName: 'CIDR'},
    //       {field: 'alternativeid', displayName: 'Alt ID'},
    //       {field: 'asn', displayName: 'ASN'},
    //       {field: 'asn_desc', displayName: 'ASN Description'},
    //       {field: 'cc', displayName: 'CC'},
    //       {field: 'confidence', displayName: 'Confidence'},
    //       {field: 'created', displayName: 'Date Created'},
    //       {field: 'description', displayName: 'Description'},
    //       {field: 'detecttime', displayName: 'Detection Time'},
    //       {field: 'id', displayName: 'ID'},
    //       {field: 'severity', displayName: 'Severity'},
    //       {field: 'subnet_start', displayName: 'Subnet Start'},
    //       {field: 'subnet_end', displayName: 'Subnet End'},
    //       {field: 'weight', displayName: 'Weight'}
    //     ];

    // Prepare incoming data
    var prepareData = function(data, status, headers, config) {
      console.log(data);
      $scope.rawData = data;
      $scope.noResults = [];
      $scope.showResults = true;
      $scope.resultsMsg = 'Results';
      $scope.data = {};
      $scope.data.iff = data.iff;
      $scope.data.program = data.program;
      $scope.data.time = data.time;
      $scope.data.results=[];
      for (var i=0; i < data.results.length; i++) {
        if (data.results[i].results.length == 0) {
          $scope.noResults.push({searchitem: data.results[i].searchitem});
        } else {
          for (var j=0; j < data.results[i].results.length; j++) {
            var detectDate = new Date(data.results[i].results[j].detecttime*1000);
            var createdDate = new Date(data.results[i].results[j].created*1000);
            data.results[i].results[j].detecttime = detectDate;
            data.results[i].results[j].created = createdDate;
          }
          $scope.data.results.push(data.results[i]);
        }
      }
    };

    var getDemo = function(file) {
      $scope.showResults = false;
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

      console.log($scope.formData);
      
      // Initialize/reset when calling a client
      $scope.showResults = false;
      $scope.showFormError = false;
      $scope.formErrorMsg = "";

      // User wants demo data - get data and return
      if ($scope.formData.demoName !== null && $scope.formData.demoName !== undefined) {
        $scope.resultsMsg = 'Results - Waiting...';
        getDemo($scope.formData.demoName);
        return;
      }

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
      Utils.setConfig(clientConfig, $scope.formData.numDays, 'numDays');
      Utils.setConfig(clientConfig, $scope.formData.ips, 'ips');
      Utils.setConfig(clientConfig, $scope.formData.stats, 'stats');
      Utils.setConfig(clientConfig, $scope.formData.header, 'header');
      if (Utils.inputPresent($scope.formData.fileName)) {
        Utils.setConfig(clientConfig, $scope.filePath+$scope.formData.fileName.name, 'fileName');
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
