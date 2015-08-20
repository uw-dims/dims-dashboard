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
      }
    };

    // Algorithm from http://stackoverflow.com/questions/19178782/how-to-reshape-an-array-with-lodash
    UserAttributesService.formatAttribute = function formatAttribute(attribute, cols) {
      return _.compact(attribute.map(function(el, i){
        if (i % cols === 0) {
          return attribute.slice(i, i + cols);
        }
      }));
    };

    UserAttributesService.getAttributes = function getAttributes(user) {
      return UserAttributesService.getAllAttributes()
        .then(function (reply) {
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
          $log.debug('UserAttributesService.getAttributes failure callback err: ', err);
          deferred.reject(err);
        });
      return deferred.promise;
    };

    return UserAttributesService;
  });
