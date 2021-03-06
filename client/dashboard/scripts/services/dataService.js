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
  .factory('DataService', ['$http', '$q', '$log',  function ($http, $q, $log) {

  var getData = function(source) {

    var deferred = $q.defer();
    $http ({
      method: 'GET',
      url: '/data',
      params: {
        source: source
      }
    }).success(function(data,status,headers,config) {
      var result = data;
      deferred.resolve(result);
    }).error(function(data,status,headers,config) {
      deferred.reject('No results. Status: ' + status);
    });

    return deferred.promise;

  };

  var parseTimeSeries = function(data) {
    var initialArray = data.split('\n');
    var finalArray = [];
    for (var i=0; i< initialArray.length; i++) {
      var lineArray = initialArray[i].split(' ');
      var finalLineArray = [];
      var lineDate = new Date(lineArray[0]).getTime();
      // var lineDate = new Date(lineArray[0]);
      finalLineArray.push(lineDate);
      finalLineArray.push(parseInt(lineArray[1]));
      finalArray.push(finalLineArray);
    }

    return finalArray;

  };

  return {
    getData: getData,
    parseTimeSeries: parseTimeSeries
  };

}]);
