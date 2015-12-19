// file: client/dashboard/scripts/directives/userProfile.directive.js

(function () {
  'use strict';

  function userProfile(UserService, $log, $rootScope) {
    var directive = {
      restrict: 'AEC',
      templateUrl: 'views/partials/userprofile.html',
      controller: 'UserProfileCtrl',
      controllerAs: 'vm',
      link: linkFunc,
      scope: {
        username: '=',
        tg: '='
      }
    };

    return directive;

    function linkFunc(scope, el, attr, ctrl) {
      // Don't need this yet
    }
  }

  angular
    .module('dimsDashboard.directives')
    .directive('userProfile', userProfile);

  userProfile.$inject = ['UserService', '$log', '$rootScope'];

}());
