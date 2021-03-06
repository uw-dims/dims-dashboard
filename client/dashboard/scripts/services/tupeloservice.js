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
          var result = JSON.parse(resource.data['tupelo']);
          deferred.resolve(result);
        },
        function (err) {
          $log.error('TupeloService.post error callback', err);
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
