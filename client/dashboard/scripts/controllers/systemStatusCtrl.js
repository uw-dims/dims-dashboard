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
