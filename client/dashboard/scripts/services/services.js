'use strict';

/* Services, factories */

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
              };
              console.log('result in getFileList success method');
              console.log(result);
              deferred.resolve(result);
        }).error(function(data,status,headers,config) {
              deferred.reject('No results. Status: '+ status);
        });
        return deferred.promise;
      };

      var getDemoList = function(type) {
        console.log('In FileService:getDemoList');
        var deferred = $q.defer();
        getFileList('default_data').then(function(data) {
          console.log('data in getDemoList then function');
          console.log(data);
          var j = 0,
              names = [];
          for (var i=0; i < data.fileNames.length; i++){
            if (data.fileNames[i].type === type) {
                names[j] = data.fileNames[i].name;
                j++;
            }
          }
          var result = {
            fileNames: names,
            filePath: data.filePath
          };
          console.log('result in GetDemoList then after filter');
          console.log(result);
          deferred.resolve(result);
        });
        return deferred.promise;
      };

      return {
        getFileList: getFileList,
        getDemoList: getDemoList
      };
    });

