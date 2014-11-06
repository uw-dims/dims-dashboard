'use strict';

/* Services, factories */

angular.module('dimsDashboard.services')
  
  .factory('SettingsService', function($q, $log, $resource) {

    var SettingsService = {

      data: {},

      set: function(settings) {
        SettingsService.data = settings;
      },

      get: function() {
        return SettingsService.data;
      },

      update: function(settings) {
        var deferred = $q.defer();
        $resource('/settings/').save({settings: settings},
          function(resource) {
          SettingsService.set(settings);
          deferred.resolve(resource);
        }, function(err) {
          $log.debug('SettingsService.update error is ', err);
          deferred.reject(err);
        });
        return deferred.promise;
      }
    };

    return SettingsService;

  });