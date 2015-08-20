// File: client/dashboard/scripts/controllers/MainnewCtrl.js
 (function () {
  'use strict';

  function MainnewCtrl($scope, $log, $location) {
    var vm = this;
    $scope.title = 'Data View';

  }

  angular
  .module('dimsDashboard.controllers')
  .controller('MainnewCtrl', MainnewCtrl);

  MainnewCtrl.$inject = ['$scope', '$log', '$location'];

}());


// EOF
