// file: client/dashboard/scripts/directives/userAttributes.directive.js

(function () {
  'use strict';

  function userAttributes() {
    var directive = {
      restrict: 'AEC',
      templateUrl: 'views/partials/userattributes.html',
      controller: 'UserAttributesCtrl',
      controllerAs: 'vm',
      link: linkFunc,
      scope: {

      }
    };
    return directive;
    function linkFunc(scope, el, attr, ctrl) {
      // Don't need this yet
    }
  }

  angular
    .module('dimsDashboard.directives')
    .directive('userAttributes', userAttributes);

  userAttributes.$inject = [];

}());
