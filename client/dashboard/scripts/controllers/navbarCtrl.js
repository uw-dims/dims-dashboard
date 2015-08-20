// File: client/dashboard/scripts/controllers/navbarCtrl.js

(function () {
  'use strict';

  // Plug controller function into AngularJS
  angular
    .module('dimsDashboard.controllers')
    .controller('NavbarCtrl', NavbarCtrl);

  NavbarCtrl.$inject = ['$scope', '$modal', 'AuthService', '$log', '$location', '$rootScope', 'ChatService', 'LogService'];

  // The controller function for the Navbar
  function NavbarCtrl($scope, $modal, AuthService, $log, $location, $rootScope, ChatService, LogService) {
    var vm = this;

    // Bindable members
    vm.logout = logout;
    // vm.settings = settings;
    // vm.messaging = messaging;
    vm.chat = chat;
    vm.logMonitor = logMonitor;
    //vm.userSettings = userSettings;

    // Logout link handler
    function logout() {
      AuthService.logout(function (err) {
        if (!err) {
          $location.path('/login');
        }
      });
    };

    // Settings link handler - creates the modal window
    // function settings(size) {
    //   var modalInstance = $modal.open({
    //     templateUrl: '../views/partials/settings.html',
    //     controller: 'SettingsCtrl'
    //   });
    // };

    // // Messaging link handler - creates the modal window
    // function messaging(size) {
    //   var modalInstance = $modal.open({
    //     templateUrl: '../views/partials/messaging.html',
    //     controller: 'MessagingCtrl'
    //   });
    // };

    function chat() {
      $rootScope.chatOn = ChatService.isRunning();
      if ($scope.chatOn) {
        // Turn it off
        $rootScope.chatOn = false;
        $log.debug('Turning chat off');
        ChatService.stop();
      } else {
        // Turn it on
        $rootScope.chatOn = true;
        $log.debug('Turning chat on');
        ChatService.start();
      }

    };

    function logMonitor() {
      $rootScope.logmonOn = LogService.isRunning();
      if ($scope.logmonOn) {
        // Turn it off
        $rootScope.logmonOn = false;
        $log.debug('Turning log monitor off');
        LogService.stop();
      } else {
        // Turn it on
        $rootScope.logmonOn = true;
        $log.debug('Turning log monitor on');
        LogService.start();
      }
    };
  }

}());

// EOF
