// File: client/dashboard/scripts/controllers/UserCtrl.js

(function () {
  'use strict';

  function UserCtrl($scope, UserService, $log, $location, $rootScope) {
    var vm = this;

    function activate() {
      if ($scope.currentUser) {
        vm.trustgroup = $scope.currentUser.currentTg;
        vm.tgDescription = $scope.currentUser.trustgroups[vm.trustgroup].tgDescription;
        UserService.getUsers(vm.trustgroup)
        .then(function (reply) {
          vm.users = reply;
          $log.debug('userCtrl getUsers reply', vm.users);
        });
      }
    }

    $scope.$on('switch-tg', function () {
      activate();
    });

    vm.getUser = function getUser(user) {
      vm.trustgroup = $scope.currentUser.currentTg;
      UserService.getUser(vm.trustgroup, user)
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

  UserCtrl.$inject = ['$scope', 'UserService', '$log', '$location', '$rootScope'];

}());

// EOF
