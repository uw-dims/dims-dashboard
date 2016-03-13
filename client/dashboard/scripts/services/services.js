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

  .factory('DateService', function() {

    // Date intializations and functions

    // Use next day as limit for calendar pickers
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    var dateConfig = {
      startOpened: false,
      endOpened: false,
      dateOptions: {
        formatYear: 'yy',
        startingDay: 0
      },
      tomorrow: tomorrow
    };

    // Open calendar picker handler
    var open = function($event, datePicker) {
      $event.preventDefault();
      $event.stopPropagation();
      if (datePicker === 'startOpened') {
        return [true, false];
      } else {
        return [false, true];
      }
    };

    return {

      dateConfig: dateConfig,
      open: open
    };

})

  .factory('Utils', function() {
    var root = {};
    root.setConfig = function(config, data, property) {
      if (root.inputPresent(data)) {
        config[property] = data;
      }
    };

    root.inputPresent = function(data) {
      if (data !== null && data !== undefined && data !== '') {
        return true;
      } else {
        return false;
      }
    };

    root.isJson = function(text) {
      try {
        JSON.parse(text);
      } catch (e) {
        console.log(e);
        return false;
      }
      return true;
    };
    return root;
  })

  .factory('FileService', ['$http', '$q', function($http, $q) {

      var getFileList = function(source) {
        var deferred = $q.defer();
        $http ({
          method: 'GET',
          url: '/files',
          params: {
            source: source,
            action: 'list'
          }
        }).success(function(data,status,headers,config){
              deferred.resolve(data);
        }).error(function(data,status,headers,config) {
              deferred.reject('No results. Status: '+ status);
        });
        return deferred.promise;
      };

      var getDemoList = function(type) {
        var deferred = $q.defer();
        getFileList('default_data').then(function(data) {
          var j = 0,
              names = [];
          for (var i=0; i < data.files.length; i++){
            if (data.files[i].type === type) {
                names[j] = data.files[i].name;
                j++;
            }
          }
          var result = {
            fileNames: names,
            filePath: data.path
          };
          deferred.resolve(result);
        });
        return deferred.promise;
      };

      return {
        getFileList: getFileList,
        getDemoList: getDemoList
      };
    }]);


