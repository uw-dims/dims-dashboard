'use strict';

/* Services, factories */

angular.module('dimsDashboard.services')
  
  .factory('SettingsService', function($http, $q, $log, $rootScope, $resource) {

    var SettingsService = {

      data: {},

      set: function(settings) {
        SettingsService.data = settings;
      },

      get: function() {
        return SettingsService.data;
      },

      update: function(settings) {
        $log.debug('SettingService.update');
        var deferred = $q.defer();
        $resource('/settings/').save({settings: settings},
          function(resource) {
          $log.debug('resource is ', resource);
          SettingsService.set(settings);
          $log.debug('settings now', SettingsService.get());
          deferred.resolve(resource);
        }, function(err) {
          $log.debug('error is ', err);
          deferred.reject(err);
        });
        return deferred.promise;
      }

    };

    return SettingsService;

  });