'use strict';
angular.module('dimsDashboard.directives').
  
  /**
   *  program - python program type to call
   *  
   */

  directive('dimsSearchForm', [ '$timeout', '$log', 'FileService', function($timeout, $log, FileService) {
    
    var link = function(scope, el, attr) {
      var queryItems = {
        'rwfind': ['startDateTime', 'endDateTime', 'numDays', 'hitLimit', 'header', 'ips', 'fileName', 'outputType'],
        'cifbulk': ['startDateTime', 'endDateTime', 'numDays', 'header', 'ips', 'fileName', 'stats'],
        'crosscor': ['fileName', 'mapName', 'stats', 'iff'],
        'anon': ['fileName', 'mapName', 'outputType', 'stats']
      }; 

      // Initialize elements 
      var initializeElements = function() {
        scope.formData = {};
        scope.outputTypes = [{
          value: 'json',
          label: 'JSON'
        },{
          value: 'text',
          label: 'TEXT'
        }];
        scope.formData.outputType = scope.outputTypes[0].value;
        scope.iffs = [{
          value: 'friend',
          label: 'Friend'
        },{
          value: 'foe',
          label: 'Foe'
        }];
        scope.formData.iff = scope.iffs[0].value;
        // Set up file pickers
        scope.fileNames = [];
        scope.mapNames = [];
        scope.showFiles = false;
        scope.showMaps = false;
        FileService.getFileList('data_files').then(function(result) {
            scope.fileNames = result.fileNames;
            scope.filePath = result.filePath;
            scope.showFiles = true;
        });
        FileService.getFileList('map_files').then(function(result) {
            scope.mapNames = result.fileNames;
            scope.mapPath = result.filePath;
            scope.showMaps = true;
        });
        scope.show = {};
      };

      var initializeShowElements = function() {
        scope.show.startDateTime = false;
        scope.show.endDateTime = false;
        scope.show.numDays = false;
        scope.show.hitLimit = false;
        scope.show.header = false;
        scope.show.ips = false;
        scope.show.fileName = false;
        scope.show.mapName = false;
        scope.show.outputType = false;
        scope.show.stats = false;
        scope.show.iff = false;
      };

      initializeElements();

      scope.$watch('tool', function(newValue, oldValue) {
        $log.debug('currentSelectedTool in dimsSearchForm: ', scope.tool);
        scope.queryItems = queryItems[scope.tool.name];
        initializeShowElements();
        $log.debug('scope.queryItems', scope.queryItems);
        // Shortcut - change this later to use scope.show
        scope.showLeftCol = (scope.tool.name === 'rwfind' || scope.tool.name === 'cifbulk');
        angular.forEach(scope.queryItems, function(value, index) {
          scope.show[value] = true;
        });

      });

    };

    return {
      restrict: 'AE',
      templateUrl: 'views/partials/searchForm.html',
      link: link,
      scope: {
        tool: '='
      }
    };
    
}]);