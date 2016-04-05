/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

 (function () {
  'use strict';

  function MainCtrl($scope, $log, $location, $window) {
    var vm = this;
    $scope.title = 'Dashboard';

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
