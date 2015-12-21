// File: client/dashboard/scripts/controllers/userProfileCtrl.js

(function () {
  'use strict';

  function UserProfileCtrl($scope, $log, UserService, $rootScope) {
    var vm = this;
    // Function to return all keys in an object. Used in template
    vm.keys = UserService.keys;
    vm.profile = {};

    vm.activate = function activate() {
      // Get current trustgroup of currentUser
      var trustgroup = $rootScope.currentUser.currentTg;
      // Specified when calling directive
      vm.username = angular.copy($scope.username);
      // Get info for the user. Must be in currentTg
      UserService.getUser(trustgroup, vm.username)
      .then(function (reply) {
        vm.profile = UserService.convertToDisplay(reply);
      })
      .catch(function (err) {
        $log.debug('userProfileCtrl.activate error from getUser is ', err);
      });
    };

    vm.activate();

    $scope.$on('switch-tg', function () {
      vm.activate();
    });
  }

  // Plug controller function into AngularJS
  angular
    .module('dimsDashboard.controllers')
    .controller('UserProfileCtrl', UserProfileCtrl);

  UserProfileCtrl.$inject = ['$scope', '$log', 'UserService', '$rootScope'];

}());

