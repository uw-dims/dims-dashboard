// File: client/dashboard/scripts/controllers/MainCtrl.js
 (function () {
  'use strict';

  function MainCtrl($scope, $log, $location, $window) {
    var vm = this;
    $scope.title = 'Dashboard';

    // vm.openSite = openSite;
    // var associatedSites = {
    //   consul: 'http://10.142.29.117:8500/ui/#/dc1/nodes',
    //   opstrust: 'https://portal.uw.ops-trust.net'
    // };
    // vm.w = {};

    // vm.openSite = function openSite(id) {
    //   $log.debug('in openSite ', id);
    //   if (!vm.w[id] || vm.w[id].closed) {
    //     vm.w[id] = $window.open(associatedSites[id], "_blank");
    //   } else {
    //     $log.debug('MainCtrl window', id, 'is already opened');
    //   }
    //   vm.w[id].focus();
    // };

    vm.notImplemented = function notImplemented() {
      $log.debug('in notImplemented');
      $window.alert('Not yet implemented');
    };

    vm.activeCss = {
      active: 'list-group-item-success',
      inactive: 'list-group-item-warning'
    };

    vm.panels = {
      mitigation: {
        name: 'mitigation',
        active: true,
        css: 'list-group-item-success',
        label: 'ON'
      },
      activities: {
        name: 'activities',
        active: true,
        css: 'list-group-item-success',
        label: 'ON'
      },
      datacenter: {
        name: 'datacenter',
        active: false,
        css: 'list-group-item-success',
        label: 'OFF'
      },
      notifications: {
        name: 'notifications',
        active: false,
        css: 'list-group-item-warning',
        label: 'OFF'
      }
    };

    // $log.debug('vm.panels is ', vm.panels);

    vm.toggleDisplay = function toggleDisplay(name) {
      $log.debug('togglePanel name', name);
      // $log.debug(vm.panels);
      // $log.debug(vm.panels[name])
      if (!vm.panels.hasOwnProperty(name)) {
        return;
      }
      vm.panels[name].active = !vm.panels[name].active;
      var cssProp = vm.panels[name].active ? 'active' : 'inactive';
      vm.panels[name].css = vm.activeCss[cssProp];
      vm.panels[name].label = vm.panels[name].active ? 'ON' : 'OFF';
    };

  }

  angular
  .module('dimsDashboard.controllers')
  .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', '$log', '$location', '$window'];

}());


// EOF
