angular.module('dimsDemo.controllers').
  controller('AnonCtrl', function ($scope, $http, $location, $routeParams) {
    console.log("In anon controller");
    $scope.callClient = function() {
     return $http.get('/anon', {
        'debug':'true',
        'verbose':'true',
        'json': 'false',
        'file': 'data/rwfind_201210011617_8428.txt'
      }).
        success(function(data, status, headers, config) {
          console.log("Anon was called successfully");
          console.log(data);
          console.log(status);
          console.log(config);
        }).
        error(function(data, status, headers, config) {
          console.log("Error");
          console.log(data);
          console.log(status);
        });
    } 

});