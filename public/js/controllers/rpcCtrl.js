

angular.module('dimsDemo.controllers').
  controller('RpcCtrl', function ($scope, $http, DateService, $location, $routeParams) {
    console.log("In rwfind controller");

    var setConfig = function(config, data, property) {
      if (inputPresent(data)) {
        config[property] = data;
      }
    };

    var inputPresent = function(data) {
      if (data !== null && data !== undefined && data !== "") return true;
      else return false;
    };

    // Setup form data
    $scope.formData = {};
    $scope.outputTypes = [{
      value: 'json',
      label: 'JSON'
    },{
      value: 'text',
      label: 'TEXT'
    }];
    $scope.formData.outputType = $scope.outputTypes[0].value;

    // Setup file picker
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
    $scope.result = null;

    $scope.callClient = function() {

      console.log($scope.formData);
      $scope.showResults = false;
      $scope.showFormError = false;
      $scope.formErrorMsg = "";

      if (!inputPresent($scope.formData.ips) && !inputPresent($scope.formData.fileName)) {
        $scope.showFormError = true;
        $scope.formErrorMsg = 'You have to either choose a file or enter the ips/CIDR/domains to search for.';
        return;
      }
      if (inputPresent($scope.formData.ips) && inputPresent($scope.formData.fileName)) {
        $scope.showFormError = true;
        $scope.formErrorMsg = 'You have to either choose a file or enter the ips/CIDR/domains to search for. You cannot do both';
        return;
      }

      var clientConfig = {};
      var startTime = (inputPresent($scope.formData.startDate)) ? $scope.formData.startDate.getTime()/1000 : null;
      var endTime = (inputPresent($scope.formData.endDate)) ? $scope.formData.endDate.getTime()/1000 : null;      
      startTime = (($scope.formData.startHour !== null) && ($scope.formData.startHour !== undefined)) ? 
          startTime + $scope.formData.startHour*60*60 : startTime;
      endTime = (($scope.formData.endHour !== null) && ($scope.formData.endHour !== undefined)) ? 
          endTime + $scope.formData.endHour*60*60 : endTime;
      setConfig(clientConfig, startTime, 'startTime');
      setConfig(clientConfig, endTime, 'endTime');
      setConfig(clientConfig, $scope.formData.outputType, 'outputType');
      setConfig(clientConfig, $scope.filePath+$scope.formData.fileName, 'fileName');
      setConfig(clientConfig, $scope.formData.numDays, 'numDays');
      setConfig(clientConfig, $scope.formData.hitLimit, 'hitLimit');
      setConfig(clientConfig, $scope.formData.ips, 'ips');
      setConfig(clientConfig, $scope.formData.header, 'header');

      console.log(clientConfig);
      console.log("Now sending http get request");

      $http(
        { method: 'GET',
          url: '/rwfind', 
          params: clientConfig
        } ).
        success(function(data, status, headers, config) {
          console.log("rwfind was called successfully");
          console.log(data);
          console.log(status);
          console.log(config);
          $scope.result = data;
          $scope.showResults = true;
          console.log('showResults is '+$scope.showResults);
        }).
        error(function(data, status, headers, config) {
          console.log("rwfind Error");
          console.log(data);
          console.log(status);
        });
      }
});