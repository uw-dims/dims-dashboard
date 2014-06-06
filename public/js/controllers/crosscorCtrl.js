angular.module('dimsDemo.controllers').
  controller('CrosscorCtrl', function ($scope, $http, $location, $routeParams) {

    // Setup form data
    $scope.formData = {};

    $scope.callClient = function() {

      console.log($scope.formData);

      var clientConfig = {};
      setConfig(clientConfig, $scope.formData.mapfile, 'mapfile');
      setConfig(clientConfig, $scope.formData.iff, 'iff');
      setConfig(clientConfig, $scope.formData.stats, 'stats');
      setConfig(clientConfig, $scope.formData.file, 'file');

      console.log(clientConfig);

      $http.get('/crosscor', clientConfig ).
        success(function(data, status, headers, config) {
          console.log("crosscor was called successfully");
          console.log(data);
          console.log(status);
          console.log(config);
        }).
        error(function(data, status, headers, config) {
          console.log("crosscor Error");
          console.log(data);
          console.log(status);
        });
      }    

});