'use strict';

angular.module('dimsDashboard.services')
  .factory('DataService', function ($http, $q, $log) {

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
      deferred.reject('No results. Status: ' + status);
    });

    return deferred.promise;

  };

  var parseTimeSeries = function(data) {
    var initialArray = data.split('\n');
    var finalArray = [];
    $log.debug('DataService.parseTimeSeries. initialArray is ', initialArray);
    for (var i=0; i< initialArray.length; i++) {
      var lineArray = initialArray[i].split(' ');
      var finalLineArray = [];
      var lineDate = new Date(lineArray[0]).getTime();
      // var lineDate = new Date(lineArray[0]);
      finalLineArray.push(lineDate);
      finalLineArray.push(parseInt(lineArray[1]));
      finalArray.push(finalLineArray);
    }

    $log.debug('DataService.parseTimeSeries. finalArray is ', finalArray);
    return finalArray;

  };

  return {
    getData: getData,
    parseTimeSeries: parseTimeSeries
  };

});
