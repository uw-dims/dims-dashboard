angular.module('dimsDashboard.controllers').
  controller('MainCtrl', ['$scope', '$location', '$routeParams', function ($scope, $location, $routeParams) {
    // write Ctrl here
    console.log('DEBUG: In MainCtrl');

    $scope.isCollapsed = true;
    $scope.showTools = false;
    $scope.showSavedQueries = false;
    $scope.showActivities = false;

    $scope.queryToggle = function() {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    $scope.setTool = function(tool) {
      console.log('setTool called: ' + tool);
    };

    $scope.getTools = function() {
      $scope.showTools = true;
      $scope.showSavedQueries = false;
    };

    $scope.getSavedQueries = function() {
      $scope.showTools = false;
      $scope.showSavedQueries = true;
    };

  }]);