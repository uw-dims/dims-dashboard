// File: client/dashboard/scripts/controllers/MainCtrl.js
 (function () {
  'use strict';

  function MainCtrl($scope, $log, $location, $window) {
    var vm = this;
    $scope.title = 'Dashboard';

    // vm.openSite = openSite;
    var associatedSites = {
      consul: 'http://10.142.29.117:8500/ui/#/dc1/nodes'
    };
    vm.w = {};

    vm.openSite = function openSite(id) {
      $log.debug('in openSite ', id);
      if (!vm.w[id] || vm.w[id].closed) {
        vm.w[id] = $window.open(associatedSites[id], "_blank");
      } else {
        $log.debug('MainCtrl window', id, 'is already opened');
      }
      vm.w[id].focus();
    };


  }

  angular
  .module('dimsDashboard.controllers')
  .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', '$log', '$location', '$window'];

}());


// EOF
