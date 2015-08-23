// File: client/dashboard/scripts/controllers/UserCtrl.js

(function () {
  'use strict';

  function UserCtrl($scope, UserService, $log, $location) {
    var vm = this;

    function activate() {
      UserService.getUsers()
      .then(function (reply) {
        vm.users = reply;
        $log.debug('userCtrl getUsers reply', vm.users);
      });
    }

    vm.getUser = function getUser(user) {
      UserService.getUser(user)
      .then(function (reply) {
        vm.profile = UserService.convertToDisplay(reply);
      });
    };

    vm.clearDisplay = function clearDisplay() {
      vm.profile = null;
    };

    activate();
  }

  // Plug controller function into AngularJS
  angular
    .module('dimsDashboard.controllers')
    .controller('UserCtrl', UserCtrl);

  UserCtrl.$inject = ['$scope', 'UserService', '$log', '$location'];

}());

// EOF
