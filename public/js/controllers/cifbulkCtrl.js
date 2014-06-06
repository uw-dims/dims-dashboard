angular.module('dimsDemo.controllers').
  controller('CifbulkCtrl', function ($scope, $http, DateService, $location, $routeParams) {
    console.log("In cifbulk controller");

    // Setup form data
    $scope.formData = {};
    $scope.dateConfig = DateService.dateConfig;

    $scope.open = function($event, datePicker) {
      var result = DateService.open($event, datePicker);
      $scope.dateConfig.startOpened = result[0];
      $scope.dateConfig.endOpened = result[1];
    };

    $scope.callClient = function() {

      console.log($scope.formData);

      var clientConfig = {};
      var startTime = (inputPresent($scope.formData.startDate)) ? $scope.formData.startDate.getTime()/1000 : null;
      var endTime = (inputPresent($scope.formData.endDate)) ? $scope.formData.endDate.getTime()/1000 : null;
      setConfig(clientConfig, startTime, 'startTime');
      setConfig(clientConfig, endTime, 'endTime');
      setConfig(clientConfig, $scope.formData.numDays, 'numDays');
      setConfig(clientConfig, $scope.formData.ips, 'ips');
      setConfig(clientConfig, $scope.formData.stats, 'stats');
      setConfig(clientConfig, $scope.formData.header, 'header');

      console.log(clientConfig);

      $http.get('/cifbulk', clientConfig ).
        success(function(data, status, headers, config) {
          console.log("cifbulk was called successfully");
          console.log(data);
          console.log(status);
          console.log(config);
        }).
        error(function(data, status, headers, config) {
          console.log("cifbulk Error");
          console.log(data);
          console.log(status);
        });
      }    
});