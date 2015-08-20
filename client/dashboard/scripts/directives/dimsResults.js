'use strict';
angular.module('dimsDashboard.directives').

  /**
   *  pid - process id returned by server
   *  showResults - controller-specified - should we specify it here?
   *  program - python program returning the data
   */

  directive('dimsRawResults', [ '$timeout', '$log', function($timeout, $log) {

    var link = function(scope, el, attr) {

      scope.$watch('rawData', function(newValue, oldValue) {
        scope.isRaw = true;
        scope.prettyData = '';

        // Data passed back from http request will be converted into object
        // automatically if possible. If not, it will be a string
        if (typeof(scope.rawData) === 'string') {
          scope.isJson = false;
        } else {
          scope.isJson = true;
        }
      });

      scope.showPrettyResults= function() {
        scope.prettyMsg = '';
        if (scope.prettyData.length === 0) {
          try {
            scope.prettyData = JSON.stringify(scope.rawData,null,2);
            scope.isRaw = false;
          } catch(e) {
            console.log(e);
            scope.prettyMsg = 'Pretty print does not work on this data.';
          }
        }
        scope.isRaw = false;
      };

      scope.showRawData = function() {
        scope.isRaw = true;
      };
    };

    return {
      restrict: 'AE',
      templateUrl: 'views/partials/rawResults.html',
      link: link
    };

}]);
