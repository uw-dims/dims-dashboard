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
    // vm.settings = settings;
    // vm.messaging = messaging;
    vm.chat = chat;
    //vm.logMonitor = logMonitor;
    vm.openSite = openSite;
    //vm.userSettings = userSettings;
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

    // Settings link handler - creates the modal window
    // function settings(size) {
    //   var modalInstance = $modal.open({
    //     templateUrl: '../views/partials/settings.html',
    //     controller: 'SettingsCtrl'
    //   });
    // };

    function chat() {
      //$rootScope.chatOn = ChatService.isRunning();
      if (ChatService.isRunning()) {
        // Turn it off
        //$rootScope.chatOn = false;
        $log.debug('navbarCtrl: Turning chat off');
        ChatService.stop();
      } else {
        // Turn it on
        //$rootScope.chatOn = true;
        $log.debug('navbarCtrl: Turning chat on');
        ChatService.start();
      }
    }

    // function logMonitor() {
    //   $rootScope.logmonOn = LogService.isRunning();
    //   if ($scope.logmonOn) {
    //     // Turn it off
    //     $rootScope.logmonOn = false;
    //     $log.debug('Turning log monitor off');
    //     LogService.stop();
    //   } else {
    //     // Turn it on
    //     $rootScope.logmonOn = true;
    //     $log.debug('Turning log monitor on');
    //     LogService.start();
    //   }
    // }
  }

}());

// EOF
