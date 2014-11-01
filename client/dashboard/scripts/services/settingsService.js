'use strict';

/* Services, factories */

angular.module('dimsDashboard.services')
  
  .factory('SettingsService', function($http, $q, $log, $rootScope) {

    // var getSettings = function(id) {
    //   var deferred = $q.defer();     
    //   $http ({
    //     method: 'GET',
    //     url: '/settings/'+id

    //   }).success(function(data,status,headers,config){
    //         deferred.resolve(data);
    //   }).error(function(data,status,headers,config) {
    //         deferred.reject('No results. Status: '+ status);
    //   });
    //   return deferred.promise;
    // };

    // var data = {};



    // return {
    //   getSettings: getSettings,
    //   data: data
    // };

    var SettingsService = {

      data: {},

      // updateSettings: function() {
      //   var id = ($rootScope.currentUser) ? $rootScope.currentUser.username : null;
      //   $log.debug('In SettingsService.updateSettings. Id is ', id);  

      //   var deferred = $q.defer();
      //   $http ({
      //     method: 'GET',
      //     url: '/settings/'+id

      //   }).success(function(data,status,headers,config){
      //     $log.debug('SettingsService.updateSettings callback. Data is ', data);
      //         SettingsService.data = data;
              
      //         deferred.resolve(data);
      //   }).error(function(data,status,headers,config) {
      //         deferred.reject('No results. Status: '+ status);
      //   });
      //   return deferred.promise;

        // SettingsService.data =  $http({
        //     method: 'GET',
        //     url: '/settings/'+id
          
        //   }).then(function(data) {
        //     $log.debug('SettingsService.updateSettings callback. Data is ', data.data);
        //     return data.data;
        //   });
      // }

    };

    return SettingsService;

  });