'use strict';

/* Services, factories */

angular.module('dimsDashboard.services')
  
  .factory('AnonService', function($http, $q) {

    var anonymize = function(anonymize, data, outputType) {
      var deferred = $q.defer(); 
      var config = {
        outputType: outputType,
        inputData: data
      };  

      if (anonymize === 'true')  {
        $http ({
          method: 'GET',
          url: '/anon',
          params: config

        }).success(function(data,status,headers,config){
              deferred.resolve(data);
        }).error(function(data,status,headers,config) {
              deferred.reject('No results. Status: '+ status);
        });
      } else {
        deferred.resolve(data);
      }
      
      return deferred.promise;
    };

    return {
      anonymize: anonymize
    };
  });