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

    var formatData = function formatData(ticketData) {
      console.log('formatData data', ticketData);
      var result = {
        known: [],
        all: []
      };
      var raw = {
        known: [],
        all: []
      };
      var trendlineKnown,
          trendlineAll;

      // Since trends are based on last time mitigations were made, 
      // which could be in the past, add a point for the time at
      // which this graph is being displayed - so we have the total
      // for today

      // knownX.push(new Date().getTime());
      // knownY.push(data[data.length - 1][1]);

      // ticketData.data.push([new Date().getTime(), ticketData.data[ticketData.data.length - 1][1]]);

      _.forEach(ticketData.data, function (value, index) {
        var x = value[0];
        var yAll = ticketData.metadata.initialNum - value[1];
        var yKnown = ticketData.metadata.knownNum - value[1];
        result.known.push({
          x: x,
          y: yKnown
        });
        result.all.push({
          x: x,
          y: yAll
        });
        raw.known.push([x, yKnown]);
        raw.all.push([x, yAll]);
      });

      result.trendKnown = getTrendline(raw.known);
      result.trendAll = getTrendline(raw.all);
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
      // Get point for current time or our results will be skewed for
      // data that hasn't changed
      knownX.push(new Date().getTime());
      knownY.push(data[data.length - 1][1]);
      console.log('knownX', knownX);
      console.log('knownY', knownY);
      return linearRegression(knownY, knownX);
    };

    var parseList = function parseList(response) {
      var result = [];
      _.forEach(response, function (value, index) {
        result.push(parseTicket(value));
      });
      return result;
    };

    var parseTicket = function parseTicket(ticketData) {
      var item = _.extend({}, ticketData);
      // item.data = formatData(ticketData.data);
      item.data = formatData(ticketData);
      // {
      //     known: [],
      //     all: [],
      //     trendKnown: object,
      //     trendAll: object
     // }
      // item.trendline = getTrendline(ticketData.data);
      $log.debug('mitigationService.parseTicket. item is ', item);
      return item;
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
      getMitigations: function (tg) {
        $log.debug('MitigationService.getMitigation');
        var deferred = $q.defer();
        MitigationApi.get({
          type: 'mitigation',
          tg: tg
        },
          function (resource) {
            var result = parseList(resource.data.mitigations);
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
          deferred.resolve(parseTicket(resource.data.mitigation));
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
