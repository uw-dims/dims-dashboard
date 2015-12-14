// File: client/dashboard/scripts/services/UserAttributesService.js

'use strict';
angular.module('dimsDashboard.services')

  .factory('AttributeApi', function ($resource) {
    return $resource('/api/attributes');
  })

  .factory('UserAttributesService', function (AttributeApi, $log, $q) {
    var UserAttributesService = {};
    UserAttributesService.supportedTypes = function () {
      return {
        cidr: 'cidr',
        domain: 'domain'
      };
    };

    // Algorithm from http://stackoverflow.com/questions/19178782/how-to-reshape-an-array-with-lodash
    UserAttributesService.formatAttribute = function formatAttribute(attribute, cols) {
      return format(attribute, cols);
    };

    var format = function format(array, numCols) {
      var numRows = _.ceil(array.length / numCols);
      var rows = [];
      for (var k = 0; k < numRows; k++) {
        rows[k] = [];
      }
      var i = 0;
      _.forEach(array, function (value, index) {
        if (i > numRows - 1) {
          i = 0;
        }
        rows[i].push(value);
        i++;
      });
      return rows;
    };

    UserAttributesService.getAttributes = function getAttributes(user) {
      $log.debug('userAttributesService.getAttributes for ', user);
      return UserAttributesService.getAllAttributes()
        .then(function (reply) {
          $log.debug('userAttributesService.getAttributes reply from getAllAttributes', reply);
          $log.debug(JSON.stringify(reply));
          $log.debug(reply[user]);
          return reply[user];
        })
        .catch(function (err) {
          $log.error('UserAttributesService.getAttributes error ', err);
          return new Error (err);
        });
    };

    UserAttributesService.getAllAttributes = function getAllAttributes() {
      var deferred = $q.defer();
      AttributeApi.get({},
        function (resource) {
          $log.debug('UserAttributesService.getAttributes success callback data: ', resource.data);
          deferred.resolve(resource.data);
        }, function (err) {
          $log.error('UserAttributesService.getAttributes failure callback err: ', err);
          deferred.reject(err);
        });
      return deferred.promise;
    };

    return UserAttributesService;
  });
