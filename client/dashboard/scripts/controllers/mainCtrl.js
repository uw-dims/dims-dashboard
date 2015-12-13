// File: client/dashboard/scripts/controllers/MainCtrl.js
 (function () {
  'use strict';

  function MainCtrl($scope, $log, $location) {
    var vm = this;
    $scope.title = 'Dashboard';

  }

  angular
  .module('dimsDashboard.controllers')
  .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', '$log', '$location'];

}());


// EOF
