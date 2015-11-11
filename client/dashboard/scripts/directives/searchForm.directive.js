// File: client/dashboard/scripts/directives/searchForm.directive.js

(function() {
  'use strict';
  // Plug directive into AngularJS
  angular
    .module('dimsDashboard.directives')
    .directive('dimsSearchForm', dimsSearchForm);

  dimsSearchForm.$inject = ['$log'];

  function dimsSearchForm($log) {

    var directive = {
      restrict: 'AE',
      templateUrl: 'views/partials/searchForm.html',
      link: linkFunc,
      controller: 'SearchForm',
      controllerAs: 'vm',
      scope: {
        tool: '=',
        callback: '&'
      }
    };

    return directive;

    function linkFunc(scope, el, attr, ctrl) {
      $log.debug('LINK dimsSearchForm: scope.tool', scope.tool);
    }

  }

}());

angular.module('dimsDashboard.directives')

//   directive('dimsSearchForm', [ '$timeout', '$log', 'FileService', function($timeout, $log, FileService) {

//     var link = function(scope, el, attr) {

//       var queryItems = {
//         'rwfind': ['startDateTime', 'endDateTime', 'numDays', 'hitLimit', 'header', 'ips', 'fileName', 'outputType'],
//         'cifbulk': ['ips', 'fileName', 'upload'],
//         'crosscor': ['fileName', 'mapName', 'stats', 'iff'],
//         'anon': ['fileName', 'mapName', 'outputType', 'stats']
//       };

//       // Initialize elements
//       var initializeElements = function() {
//         scope.formData = {};
//         scope.outputTypes = [{
//           value: 'json',
//           label: 'JSON'
//         },{
//           value: 'text',
//           label: 'TEXT'
//         }];

//         scope.iffs = [{
//           value: 'friend',
//           label: 'Friend'
//         },{
//           value: 'foe',
//           label: 'Foe'
//         }];


//         scope.show = {};

//         scope.tooltips = {
//           date: 'YYYY-MM-DD or YYY-MM-DDThh:mm:ssTZD, where TZD is time zone designator',
//           htmlDate: 'Examples: 2014-07-29 <br/>2014-07-29T07:52:36Z<br/>2014-07-29T02:52:36-05:00'
//         };
//       };

//       var initializeShowElements = function() {
//         scope.show.startDateTime = false;
//         scope.show.endDateTime = false;
//         scope.show.numDays = false;
//         scope.show.hitLimit = false;
//         scope.show.header = false;
//         scope.show.ips = false;
//         scope.show.fileName = false;
//         scope.show.mapName = false;
//         scope.show.outputType = false;
//         scope.show.stats = false;
//         scope.show.iff = false;
//         scope.show.upload = false;
//       };

//       initializeElements();

//       // Watch the value of the current selected tool
//       scope.$watch('tool', function(newValue, oldValue) {
//         // $log.debug('currentSelectedTool in dimsSearchForm: ', scope.tool);
//         //  $log.debug('function in dimsSearchForm: ', scope.call);
//         scope.queryItems = queryItems[scope.tool.name];
//         initializeShowElements();
//         // $log.debug('scope.queryItems', scope.queryItems);
//         // Shortcut - change this later to use scope.show
//         scope.showLeftCol = (scope.tool.name === 'rwfind');
//         angular.forEach(scope.queryItems, function(value, index) {
//           scope.show[value] = true;
//         });
//         if (scope.show.outputType) {
//           scope.formData.outputType = (scope.formData.outputType) ? scope.formData.outputType: scope.outputTypes[0].value;
//         }
//         if (scope.show.iff) {
//           scope.formData.iff = (scope.formData.iff) ? scope.formData.iff : scope.iffs[0].value;
//         }
//       });

//       //unwrap
//       scope.callback = scope.callback();
//     };

//     return {
//       restrict: 'AE',
//       templateUrl: 'views/partials/searchForm.html',
//       link: link,
//       scope: {
//         tool: '=',
//         callback: '&'
//       }
//     };

// }])

.directive('dimsTestForm', [ '$timeout', '$log', 'FileService', function($timeout, $log, FileService) {
  var link = function(scope, el, attr) {

    var queryItems = {
      'rwfind': ['ips', 'header', 'iff'],
      'cifbulk': ['ips', 'stats']
    };
    var initializeShowElements = function() {
        scope.show.header = false;
        scope.show.ips = false;
        scope.show.stats = false;
        scope.show.iff = false;
        scope.show.upload = false;
      };

    // scope.formData = {
    //   ips: '192.168.56.71',
    //   stats: true,
    //   header: false,
    //   iff: 'friend'
    // };

    $log.debug('directive link: tool is ', scope.tool);
    $log.debug('directive link: currentTool is ', scope.current);
    $log.debug('directive link: formData is ', scope.formData);

    // Watch the value of the current selected tool
    scope.$watch('current', function(newValue, oldValue) {
      $log.debug('watching currentTool newvalue is ', newValue, 'oldValue is ', oldValue);
      // $log.debug('currentSelectedTool in dimsTestForm: ', scope.currentTool);
      // $log.debug('tool in dimsTestForm: ', scope.tool);
    });

    // scope.$watch('tool', function(newValue,oldValue) {
    //   $log.debug('tool changed value');
    // });

  };

  var controller = function($scope, $element, $attrs) {
    $scope.formData = {
      ips: '192.168.56.71',
      stats: true,
      header: false,
      iff: 'friend'
    };
    $log.debug('testform controller, formData is', $scope.formData);
    $log.debug('testform controller, tool is ', $scope.tool);
    $log.debug('testform controller, current is ', $scope.current);
  };

  return {
    restrict: 'AE',
    templateUrl: 'views/partials/testForm.html',
    link: link,
    scope: {
      'tool': '=',
      'current': '='
    },
    controller: controller
  };

}])
;

