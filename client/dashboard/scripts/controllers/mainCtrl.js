angular.module('dimsDashboard.controllers').
  controller('MainCtrl', ['$scope', '$location', '$routeParams', '$log', function ($scope, $location, $routeParams, $log) {
    // write Ctrl here
    $log.debug('In MainCtrl');

    $scope.isCollapsed = true;
    $scope.showTools = false;
    $scope.showSavedQueries = false;
    $scope.showActivities = false;
    
    var initializeList = function() {
      $scope.groupActive = {
        'rwfind' : '',
        'cifbulk': '',
        'crosscor' : '',
        'anon' : ''
      };
    };

    initializeList();

    $scope.savedDemoQueries = [];

    // Demo data
    for (var i=0; i<10; i++) {
      $scope.savedDemoQueries.push({
        'name' : 'Demo Query '+ i,
        'key' : 'key'+i
      });
    }
    $log.debug('Saved queries: ', $scope.savedDemoQueries);

    $scope.queryToggle = function() {
      $scope.isCollapsed = !$scope.isCollapsed;
      $log.debug('query panel toggle called');
    };

    $scope.setTool = function(tool) {
      $log.debug('setTool called: ' + tool);
      initializeList();
      $log.debug('groupActive after initialize', $scope.groupActive);
      $scope.groupActive[tool] = 'active';
      $log.debug('groupActive after setting tool', $scope.groupActive);
    };

    $scope.setQuery = function(query) {
      $log.debug('setQuery called: ',query);
      $scope.currentSelectedQuery = query;
    };


    $scope.getTools = function() {
      $scope.showTools = true;
      $scope.showSavedQueries = false;
      $log.debug('getTools called');
    };

    $scope.getSavedQueries = function() {
      $scope.showTools = false;
      $scope.showSavedQueries = true;
      $log.debug('getSavedQueries called');
    };
  }]);