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

  .factory('RPCService', function() {

      return true;

  })

;

