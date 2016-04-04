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

  // Plug controller function into AngularJS
  angular
    .module('dimsDashboard.controllers')
    .controller('NavbarCtrl', NavbarCtrl);

  NavbarCtrl.$inject = ['$scope', '$modal', 'AuthService', '$log', '$location', '$rootScope', 'ChatService', '$window', 'siteVars'];

  // The controller function for the Navbar
  function NavbarCtrl($scope, $modal, AuthService, $log, $location, $rootScope, ChatService,  $window, siteVars) {
    var vm = this;

    // Bindable members
    vm.logout = logout;
    vm.chat = chat;
    vm.logMonitor = logMonitor;
    vm.siteOrg = siteVars.siteOrg;
    // vm.openSite = openSite;
    // var associatedSites = {
    //   opstrust: 'https://portal.uw.ops-trust.net',
    //   opstrustwiki: 'https://wiki.uw.ops-trust.net/dims/bin/view/Main/WebHome'
    // };
    // vm.w = {};

    // function openSite(id) {
    //   if (!vm.w[id] || vm.w[id].closed) {
    //     vm.w[id] = $window.open(associatedSites[id], "_blank");
    //   } else {
    //     $log.debug('NavbarCtrl window', id, 'is already opened');
    //   }
    //   vm.w[id].focus();
    // }


    // Logout link handler
    function logout() {
      AuthService.logout(function (err) {
        if (!err) {
          $location.path('/login');
        }
      });
    }

    function chat() {
      if (ChatService.isRunning()) {
        $log.debug('navbarCtrl: Turning chat off');
        ChatService.stop();
      } else {
        $log.debug('navbarCtrl: Turning chat on');
        ChatService.start();
      }
    }

    function logMonitor() {
      if ($rootScope.logWindowOn) {
        $rootScope.logWindowOn = false;
      } else {
        $rootScope.logWindowOn = true;
      }
    }
  }

}());

// EOF
