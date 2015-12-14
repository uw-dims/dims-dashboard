'use strict';

(function () {

  var MitigationApi = function ($resource) {
    return $resource('api/ticket/:id', {
      id: '@id'
    }, {
      update: {
        method: 'PUT',
        url: 'api/ticket/:id'
      },
      action: {
        method: 'PUT',
        url: 'api/ticket/:id/action'
      }
    });
  };

  var MitigationService = function (MitigationApi, $log, $q, $modal) {

    var parseData = function parseData(data) {
      var newArray = [];
      _.forEach(data, function (value, index) {
        newArray.push(_.parseInt(value));
      });
      return newArray;
    };

    // Formats data - but we'll let the client do it for now
    var formatData = function formatData(data) {
      var result = [];
      var chunked = _.chunk(data, 2);
      _.forEach(chunked, function (value, index) {
        result.push({
          x: value[1],
          y: value[0]
        });
      });
      return result;
    };

    var parseResponse = function parseResponse(response) {
      var result = [];
      _.forEach(response, function (value, index) {
        value.data = formatData(parseData(value.data));
        result.push(value);
      });
      return result;
    };

    var mitigationService = {
      getMitigation: function () {
        $log.debug('MitigationService.getMitigation');
        var deferred = $q.defer();
        MitigationApi.get({
          type: 'mitigation'
        },
          function (resource) {
            $log.debug('MitigationService.getMitigation success callback data', resource.data);
            var result = parseResponse(resource.data);
            // Return the result
            deferred.resolve(result);
          },
          function (err) {
            $log.debug('MitigationService.getMitigation error callback', err);
            deferred.reject(err);
          });
        return deferred.promise;
      },

      remediate: function (id, ips) {
        $log.debug('remediate id is ', id);
        $log.debug('ips are ', ips);
        var deferred = $q.defer();
        MitigationApi.update({
          id: id},
          {type: 'mitigation',
          action: 'remediate',
          ips: ips
        },
        function (resource) {
          $log.debug('MitigationService.remediate success ', resource);
          deferred.resolve(resource);
        },
        function (err) {
          $log.debug('MitigationService.remediate error callback', err);
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
  MitigationService.$inject = ['MitigationApi', '$log', '$q', '$modal'];

}());
