'use strict';

/* Services, factories */

angular.module('dimsDashboard.services')
  
  .factory('AnonService', function($http, $q) {

    var anonymize = function(anonymize, data, pid) {
      var deferred = $q.defer(); 
      var config = {
        type: 'anon',
      };  

      if (anonymize === 'true')  {
        console.log('Call anonymize function');
        $http ({
          method: 'POST',
          url: '/anon',
          params: config,
          data: data

        }).success(function(data,status,headers,config){
              console.log('Anonymized results received');
              deferred.resolve(data);
        }).error(function(data,status,headers,config) {
              console.log('Anonymize error ' + status);
              deferred.reject('No results. Status: '+ status);
        });
      } else {
        console.log('No call to anonymize');
        deferred.resolve({
          data: data,
          pid: pid
        });
      }
      
      return deferred.promise;
    };

    return {
      anonymize: anonymize
    };
  });