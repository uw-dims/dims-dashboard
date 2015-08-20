// File: client/dashboard/scripts/controllers/UserInfoCtrl.js

(function () {
  'use strict';

  function UserInfoCtrl($scope, UserService, $log, $routeParams, $location, $rootScope) {
    var vm = this;
    $log.debug('UserInfoCtrl. param is ', $routeParams.type);
    $log.debug('UserInfoCtrl. routeParams is ', $routeParams);

    $scope.tabs = [
    {
      active: true
    }, {
      active: false
    }, {
      active: false
    }];

    $scope.active = {
      settings: false,
      profile: true,
      attributes: false
    };

    // var activateTab = function activateTab(num) {
    //   if (num >= 0 && num <= 2) {
    //     $scope.tabs[num].active = true;
    //   }
    // };

    var activateTab = function activateTab(type) {
      if (type !== undefined && $scope.active.hasOwnProperty(type)) {
        $log.debug('type is ', type);
        $scope.active[type] = true;
      }
    };

    activateTab($routeParams.type);

    // if ($routeParams.type === 'settings') {
    //   activateTab(2);
    // }

  }

  // Plug controller function into AngularJS
  angular
    .module('dimsDashboard.controllers')
    .controller('UserInfoCtrl', UserInfoCtrl);

  UserInfoCtrl.$inject = ['$scope', 'UserService', '$log', '$routeParams', '$location', '$rootScope'];


}());

// EOF
