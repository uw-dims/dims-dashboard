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
angular.module('dimsDashboard.services')

  .factory('AttributeApi', ['$resource', function ($resource) {
    return $resource('/api/attributes/:id', {
      id: '@id'
    }, {
      update: {
        method: 'PUT',
        url: 'api/attributes/:id'
      }
    });
  }])

  .factory('UserAttributesService', ['AttributeApi', '$log', '$q', function (AttributeApi, $log, $q) {
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
          deferred.resolve(resource);
        },
        function (err) {
          $log.debug('UserAttributesService.updateAttribute callback', err);
          deferred.reject(err);
        });
        return deferred.promise;
    };

    return UserAttributesService;
  }]);
