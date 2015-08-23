// File: client/dashboard/scripts/controllers/userProfileCtrl.js

(function () {
  'use strict';

  function UserProfileCtrl($scope, $log, $location, UserService) {
    var vm = this;
    vm.profile = {};
    vm.keys = UserService.keys;

    function init() {
      $scope.id = angular.copy($scope.username);
    }

    init();

    function activate() {
      $log.debug('userProfileCtrl username is ', $scope.id);
      UserService.getUser($scope.id)
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

  UserProfileCtrl.$inject = ['$scope', '$log', '$location', 'UserService'];

}());

// EOF
