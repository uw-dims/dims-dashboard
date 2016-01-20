(function () {
  'use strict';

  function mitigations(MitigationService, $log, $rootScope) {
    var directive = {
      restrict: 'AEC',
      templateUrl: 'views/partials/mitigations.html',
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
      vm.resultsFound = false;
      var getMitigations = function getMitigations(tg) {
        MitigationService.getMitigations(tg)
        .then(function (reply) {
          console.log('mitigations.directive getMitigations reply, vm.mitigationsData', reply);
          vm.mitigationsData = reply;
          if (vm.mitigationsData.length === 0) {
            // No results
            vm.resultsFound = false;
          } else {
            vm.resultsFound = true;
          }
        })
        .catch(function (err) {
          $log.debug(err);
        });
      };

      var init = function init() {
        $log.debug('mitigations.directive init');
        if ($rootScope.currentUser) {
          vm.trustgroup = angular.copy($rootScope.currentUser.currentTg);
          getMitigations(vm.trustgroup);
        }
      };

      init();

      $scope.$on('switch-tg', function () {
        $log.debug('mitigations.directive received switch-tg');
        init();
      });

      vm.addMitigation = function addMitigation() {
        $log.debug('add mitigation called');
      };

    }
  }

  angular
    .module('dimsDashboard.directives')
    .directive('mitigations', mitigations);

  mitigations.$inject = ['MitigationService', '$log', '$rootScope'];

}());
