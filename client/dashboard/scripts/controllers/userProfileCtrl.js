// File: client/dashboard/scripts/controllers/userProfileCtrl.js

(function () {
  'use strict';

  function UserProfileCtrl($scope, $rootScope, $log, $location, UserService) {
    var vm = this;
    vm.profile = {};

    vm.keys = UserService.keys;

    function activate() {
      UserService.getUser($rootScope.currentUser.username)
      .then(function (reply) {
        vm.profile = UserService.convertToDisplay(reply);
        $log.debug('userProfileCtrl.js reply is ', vm.profile);
      });
    }

    activate();

  }

  // Plug controller function into AngularJS
  angular
    .module('dimsDashboard.controllers')
    .controller('UserProfileCtrl', UserProfileCtrl);

  UserProfileCtrl.$inject = ['$scope', '$rootScope', '$log', '$location', 'UserService'];

}());

// EOF
