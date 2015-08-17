// File: client/dashboard/scripts/controllers/UserCtrl.js

(function () {

  // Plug controller function into AngularJS
  angular
    .module('dimsdashboard.controllers')
    .controller('UserCtrl', UserCtrl);

  UserCtrl.$inject = ['$scope', 'UserService', '$log'];

  function UserCtrl($scope, UserService, $log) {
    var vm = this;
  };

}());

// EOF
