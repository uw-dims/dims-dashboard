 (function () {
  'use strict';

  function SystemStatusCtrl($scope, $log, $location, $window) {
    var vm = this;
    $scope.title = 'Dashboard';

    // vm.openSite = openSite;
    var associatedSites = {
      consul: 'http://10.142.29.117:8500/ui/#/dc1/nodes',
      opstrust: 'https://portal.uw.ops-trust.net'
    };
    vm.w = {};

    vm.openSite = function openSite(id) {
      $log.debug('in openSite ', id);
      if (!vm.w[id] || vm.w[id].closed) {
        vm.w[id] = $window.open(associatedSites[id], "_blank");
      } else {
        $log.debug('SystemStatusCtrl window', id, 'is already opened');
      }
      vm.w[id].focus();
    };

    vm.notImplemented = function notImplemented() {
      $log.debug('in notImplemented');
      $window.alert('Not yet implemented');
    };


  }

  angular
  .module('dimsDashboard.controllers')
  .controller('SystemStatusCtrl', SystemStatusCtrl);

  SystemStatusCtrl.$inject = ['$scope', '$log', '$location', '$window'];

}());
