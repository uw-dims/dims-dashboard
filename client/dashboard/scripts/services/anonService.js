'use strict';

angular.module('dimsDashboard.services')
  
  .factory('AnonService', function($http, $q, $log) {

    var anonymize = function(anonymize, data, pid) {
      var deferred = $q.defer(); 
      var config = {
        type: 'anon',
      };  

      if (anonymize === 'true')  {
        $log.debug('services/anonService: Call anonymize function');
        $log.debug('service/anonService. params ', config, ', data: ', data);
        $http ({
          method: 'POST',
          url: '/anon',
          params: config,
          data: data

        }).success(function(data,status,headers,config){
              console.log('Anonymized results received');
              console.log(data);
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