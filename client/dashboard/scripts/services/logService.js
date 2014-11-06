'use strict';

/* Services, factories */

// angular.module('dimsDashboard.services')
  
//   .factory('LogService', function($q, $log, $resource) {

//     var LogService = {

//       data: {},

//       set: function(settings) {
//         LogService.data = settings;
//       },

//       get: function() {
//         return LogService.data;
//       },

      // update: function(settings) {
      //   var deferred = $q.defer();
      //   $resource('/settings/').save({settings: settings},
      //     function(resource) {
      //     LogService.set(settings);
      //     deferred.resolve(resource);
      //   }, function(err) {
      //     $log.debug('ChatService.update error is ', err);
      //     deferred.reject(err);
      //   });
      //   return deferred.promise;
      // }
  //   };

  //   return LogService;

  // });