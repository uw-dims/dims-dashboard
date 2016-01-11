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
      console.log('formatData data', data);
      var result = [];
      // var chunked = _.chunk(data, 2);
      // _.forEach(chunked, function (value, index) {
      _.forEach(data, function (value, index) {
        result.push({
          x: _.parseInt(value[0]),
          y: _.parseInt(value[1])
        });
      });
      return result;
    };

    var getTrendline = function getTrendline(data) {
      console.log('in trendline, data', data);
      var knownX = [];
      var knownY = [];
      _.forEach(data, function (value) {
        knownX.push(value[0]);
        knownY.push(value[1]);
      });
      console.log('knownX', knownX);
      console.log('knownY', knownY);
      return linearRegression(knownY, knownX);
    };

    var parseResponse = function parseResponse(response) {
      var result = [];
      _.forEach(response, function (value, index) {
        // value.data = formatData(parseData(value.data));
        var item = _.extend({}, value);
        console.log('item', item);
        item.data = formatData(value.data);
        item.trendline = getTrendline(value.data);
        result.push(item);
      });
      return result;
    };

    //http://trentrichardson.com/2010/04/06/compute-linear-regressions-in-javascript/
    var linearRegression = function linearRegression(y, x) {
      var lr = {};
      var n = y.length;
      var sum_x = 0;
      var sum_y = 0;
      var sum_xy = 0;
      var sum_xx = 0;
      var sum_yy = 0;
      for (var i = 0; i < y.length; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += (x[i] * y[i]);
        sum_xx += (x[i] * x[i]);
        sum_yy += (y[i] * y[i]);
      }
      lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
      lr['intercept'] = (sum_y - lr.slope * sum_x) / n;
      lr['r2'] = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);
      return lr;
    };

    var mitigationService = {
      getMitigations: function () {
        $log.debug('MitigationService.getMitigation');
        var deferred = $q.defer();
        MitigationApi.get({
          type: 'mitigation'
        },
          function (resource) {
            var result = parseResponse(resource.data);
            // Return the result
            deferred.resolve(result);
          },
          function (err) {
            $log.debug('MitigationService.getMitigations error callback', err);
            deferred.reject(err);
          });
        return deferred.promise;
      },

      getMitigation: function (id) {
        var deferred = $q.defer();
        MitigationApi.get({
          id: id,
          type: 'mitigation'
        },
        function (resource) {
          $log.debug('MitigationService.getMitigation success ', resource);
          deferred.resolve(resource);
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
