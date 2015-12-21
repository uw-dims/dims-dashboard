// File: client/dashboard/scripts/controllers/navbarCtrl.js

(function () {
  'use strict';

  // Plug controller function into AngularJS
  angular
    .module('dimsDashboard.controllers')
    .controller('NavbarCtrl', NavbarCtrl);

  NavbarCtrl.$inject = ['$scope', '$modal', 'AuthService', '$log', '$location', '$rootScope', 'ChatService', '$window'];

  // The controller function for the Navbar
  function NavbarCtrl($scope, $modal, AuthService, $log, $location, $rootScope, ChatService,  $window) {
    var vm = this;

    // Bindable members
    vm.logout = logout;
    vm.chat = chat;
    vm.logMonitor = logMonitor;
    vm.openSite = openSite;
    var associatedSites = {
      opstrust: 'https://portal.uw.ops-trust.net',
      opstrustwiki: 'https://wiki.uw.ops-trust.net/dims/bin/view/Main/WebHome'
    };
    vm.w = {};

    function openSite(id) {
      if (!vm.w[id] || vm.w[id].closed) {
        vm.w[id] = $window.open(associatedSites[id], "_blank");
      } else {
        $log.debug('NavbarCtrl window', id, 'is already opened');
      }
      vm.w[id].focus();
    }


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
