// File: client/dashboard/scripts/controllers/navbarCtrl.js

(function () {
  'use strict';

  // Plug controller function into AngularJS
  angular
    .module('dimsDashboard.controllers')
    .controller('NavbarCtrl', NavbarCtrl);

  NavbarCtrl.$inject = ['$scope', '$modal', 'AuthService', '$log', '$location'];

  // The controller function for the Navbar
  function NavbarCtrl($scope, $modal, AuthService, $log, $location) {
    var vm = this;

    // Bindable members
    vm.logout = logout;
    vm.settings = settings;
    vm.messaging = messaging;

    // Logout link handler
    function logout() {
      AuthService.logout(function(err) {
        if(!err) {
          $location.path('/login');
        }
      });
    };

    // Settings link handler - creates the modal window
    function settings(size) {
      var modalInstance = $modal.open({
        templateUrl: '../views/partials/settings.html',
        controller: 'SettingsCtrl'
      });
    };

    // Messaging link handler - creates the modal window
    function messaging(size) {
      var modalInstance = $modal.open({
        templateUrl: '../views/partials/messaging.html',
        controller: 'MessagingCtrl'
      });
    };
  }

}());

// EOF
