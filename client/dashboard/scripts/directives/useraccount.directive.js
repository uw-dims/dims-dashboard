(function () {
  'use strict';

  function userAccount() {
    var directive = {
      restrict: 'AEC',
      templateUrl: 'views/partials/useraccount.html',
      controller: controllerFunc,
      controllerAs: 'vm',
      link: linkFunc,
      scope: {

      }
    };

    return directive;

    function linkFunc(scope, el, attr, ctrl) {
      // Don't need this yet
    }

    function controllerFunc($scope) {
      var vm = this;

      vm.username = anguler.copy($rootScope.currentUser.username);


    }
  }

  angular
    .module('dimsDashboard.directives')
    .directive('userAccount', userAccount);

  userSettings.$inject = [];

}());
