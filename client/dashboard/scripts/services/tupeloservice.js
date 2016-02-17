'use strict';

(function () {


  var TupeloApi = function ($resource) {
    return $resource('api/tupelo');
  };

  var TupeloService = function (TupeloApi, $log, $q) {
    var tupeloService = {};

    tupeloService.lookupHashes = function lookupHashes(hashes) {
      var deferred = $q.defer();

      TupeloApi.save(
        { algorithm: 'md5',
          hashes: hashes
          },
        function (resource) {
          $log.debug('TupeloService.post success ', resource);
          var result = JSON.parse(resource.data['tupelo']);
          deferred.resolve(result);
        },
        function (err) {
          $log.debug('TupeloService.post error callback', err);
          deferred.reject(err);
        });

        return deferred.promise;
      }
    
    return tupeloService;
  };

  angular.module('dimsDashboard.services')
  .factory('TupeloApi', TupeloApi)
  .factory('TupeloService', TupeloService);

  TupeloApi.$inject = ['$resource'];
  TupeloService.$inject = ['TupeloApi', '$log', '$q'];

}());
