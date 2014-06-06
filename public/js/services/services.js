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

    .factory('FileService', function($http) {
      var root = {};

      root.getFileList = function(source) {
        var result = {},
            fileNames = [];
        $http ({
          method: 'GET',
          url: '/files',
          params: {
            source: source,
            action: 'action'
          }
        })

      }
    });

