// File: client/dashboard/scripts/controllers/UserInfoCtrl.js

(function () {
  'use strict';

  function UserInfoCtrl($scope, UserService, $log, $routeParams, $location) {
    var vm = this;
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

    var activateTab = function activateTab(type) {
      if (type !== undefined && $scope.active.hasOwnProperty(type)) {
        $log.debug('type is ', type);
        $scope.active[type] = true;
      }
    };

    activateTab($routeParams.type);
  }

  // Plug controller function into AngularJS
  angular
    .module('dimsDashboard.controllers')
    .controller('UserInfoCtrl', UserInfoCtrl);

  UserInfoCtrl.$inject = ['$scope', 'UserService', '$log', '$routeParams', '$location'];

}());

