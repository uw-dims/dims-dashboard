/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
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
      item.data = formatData(ticketData);
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

      create: function (ips, name, description, tg) {
        var deferred = $q.defer();
        $log.debug('mitigation create ips', ips);
        MitigationApi.save({},
          {
            type: 'mitigation',
            name: name,
            description: description,
            tg: tg,
            content: ips
          },
        function (resource) {
          $log.debug('MitigationService.create success ', resource);
          deferred.resolve(resource);
        },
        function (err) {
          $log.debug('MitigationService.create error callback', err);
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
