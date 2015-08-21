'use strict';

angular.module('dimsDashboard.services')

.factory('LmApi', function ($resource) {
  return $resource('/api/lmsearch');
})

.factory('LmService', function (LmApi, $log, $q) {
  var LmService = {};

  var get = function get() {
    var deferred = $q.defer();
    LmApi.get({},
      function (resource) {
        deferred.resolve(resource.data);
      }, function (err) {
        deferred.reject(err);
      });
    return deferred.promise;
  };

  LmService.get = get;
  return LmService;
});
