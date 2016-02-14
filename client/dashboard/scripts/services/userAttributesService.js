// File: client/dashboard/scripts/services/UserAttributesService.js

'use strict';
angular.module('dimsDashboard.services')

  .factory('AttributeApi', function ($resource) {
    return $resource('/api/attributes/:id', {
      id: '@id'
    }, {
      update: {
        method: 'PUT',
        url: 'api/attributes/:id'
      }
    });
  })

  .factory('UserAttributesService', function (AttributeApi, $log, $q) {
    var UserAttributesService = {};
    UserAttributesService.supportedTypes = function () {
      return {
        cidr: 'cidr',
        domain: 'domain',
        tlp: 'tlp'
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
      var deferred = $q.defer();
      AttributeApi.get({
        id: user
      }, function (resource) {
        deferred.resolve(resource.data);
      }, function (err) {
        $log.error('UserAttributesService.getAttributes failure callback err: ', err);
        deferred.reject(err);
      });
      return deferred.promise;
    };

    UserAttributesService.getAllAttributes = function getAllAttributes() {
      var deferred = $q.defer();
      AttributeApi.get({},
        function (resource) {
          deferred.resolve(resource.data);
        }, function (err) {
          $log.error('UserAttributesService.getAllAttributes failure callback err: ', err);
          deferred.reject(err);
        });
      return deferred.promise;
    };

    UserAttributesService.updateAttribute = function updateAttribute(user, type, action, values) {
      var deferred = $q.defer();
      AttributeApi.update({
        id: user
      }, {
        action: action,
        type: type,
        items: values
      },
        function (resource) {
          $log.debug('UserAttributesService.updateAttribute success ', resource);
          deferred.resolve(resource);
        },
        function (err) {
          $log.debug('UserAttributesService.updateAttribute callback', err);
          deferred.reject(err);
        });
        return deferred.promise;
    };

    return UserAttributesService;
  });
