'use strict';

(function () {

  var MitigationApi = function ($resource) {
    return $resource('api/ticket/:id', {
      type: 'mitigation'
    });
  };

  var MitigationService = function (MitigationApi, $log, $q) {

    var mitigationService = {
      getMitigation: function () {
        var deferred = $q.defer();
        MitigationApi.get({},
          function (resource) {
            $log.debug('MitigationService.getMitigation success callback data', resource.data);
            console.log(resource.data);
            deferred.resolve(resource.data);
          },
          function (err) {
            $log.debug('MitigationService.getMitigation error callback', err);
            deferred.reject(err);
          });
        return deferred.promise;
      }
    };

    return mitigationService;

  };

  angular.module('dimsDashboard.services')
  .factory('MitigationApi', MitigationApi)
  .factory('MitigationService', MitigationService);

  MitigationApi.$inject = ['$resource'];
  MitigationService.$inject = ['MitigationApi', '$log', '$q'];

}());
