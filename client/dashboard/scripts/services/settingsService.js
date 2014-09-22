'use strict';

/* Services, factories */

angular.module('dimsDashboard.services')
  
  .factory('SettingsService', function($http, $q) {

    var getSettings = function(id) {
      var deferred = $q.defer();     
      $http ({
        method: 'GET',
        url: '/settings/'+id

      }).success(function(data,status,headers,config){
            deferred.resolve(data);
      }).error(function(data,status,headers,config) {
            deferred.reject('No results. Status: '+ status);
      });
      return deferred.promise;
    };

    return {
      getSettings: getSettings,
    };
  });