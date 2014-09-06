'use strict';
angular.module('dimsDashboard.directives').
  
  /**
   *  program - python program type to call
   *  
   */

  directive('dimsSearchForm', [ '$timeout', '$log', function($timeout, $log) {
    
    var link = function(scope, el, attr) {

      


    };

    return {
      restrict: 'AE',
      templateUrl: 'views/partials/searchForm.html',
      link: link,
    };
    
}]);