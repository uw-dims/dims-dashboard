'use strict';

/* Services, factories */

angular.module('dimsDemo.services', [])
  
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
    }

    // Open calendar picker handler
    var open = function($event, datePicker) {
      $event.preventDefault();
      $event.stopPropagation();
      if (datePicker === 'startOpened') {
        return [true, false]
      } else {
        return [false, true]
      }
    }; 

    return {

      dateConfig: dateConfig,
      open: open
    }

})

  .factory('Utils', function() {

    var root = {};

    root.setConfig = function(config, data, property) {
      if (root.inputPresent(data)) {
        config[property] = data;
      }
    };

    root.inputPresent = function(data) {
      if (data !== null && data !== undefined && data !== "") return true;
      else return false;
    }

    return root;
  })

  .factory('FileService', function($http, $q) {

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
              var result = {
                fileNames: data.result,
                filePath: data.path
              } 
              deferred.resolve(result)
        }).error(function(data,status,headers,config) {
              deferred.reject("No results. Status: "+ status);
        });
        return deferred.promise;
      };
      
      return {
        getFileList: getFileList,
      };
    });

