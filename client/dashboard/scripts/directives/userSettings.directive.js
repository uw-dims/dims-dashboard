// file: client/dashboard/scripts/directives/userSettings.directive.js

(function () {
  'use strict';

  function userSettings() {
    var directive = {
      restrict: 'AEC',
      templateUrl: 'views/partials/usersettings.html',
      controller: 'UserSettingsCtrl',
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
    .directive('userSettings', userSettings);

  userSettings.$inject = [];

}());
