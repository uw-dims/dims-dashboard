// File: client/dashboard/scripts/controllers/UserCtrl.js

(function () {
  'use strict';

  // Plug controller function into AngularJS
  angular
    .module('dimsDashboard.controllers')
    .controller('UserCtrl', UserCtrl);

  UserCtrl.$inject = ['$scope', 'UserService', '$log', '$location'];

  function UserCtrl($scope, UserService, $log, $location) {
    var vm = this;
  };

}());

// EOF
