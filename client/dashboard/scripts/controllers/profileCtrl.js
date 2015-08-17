// File: client/dashboard/scripts/controllers/profileCtrl.js

(function () {

  // Plug controller function into AngularJS
  angular
    .module('dimsdashboard.controllers')
    .controller('ProfileCtrl', ProfileCtrl);

  ProfileCtrl.$inject = ['$scope', 'UserService', '$log'];

  function ProfileCtrl($scope, UserService, $log) {
    var vm = this;
  };

}());

// EOF
