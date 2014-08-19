'use strict';

angular.module('dimsDemo.services').factory('DataService', function($http, $q) {

  // var root={};

  // root.getNextData = function(startRec, endRec, output, data) {
  //   for (var i=startRec; i<end; i++) {
  //     output.push(data[i]);
  //   }
  //   startRec = endRec;
  // };

  var getData = function(source) {
    console.log('in DataService.getData');

    var deferred = $q.defer();
    $http ({
      method: 'GET',
      url: '/data',
      params: {
        source: source
      }
    }).success(function(data,status,headers,config) {
      var result = data;
      console.log('result in getData success method');
      console.log(result);
      deferred.resolve(result);
    }).error(function(data,status,headers,config) {
      deferred.reject("No results. Status: " + status);
    })

    return deferred.promise;

  }

  return {
    getData: getData
  }

});