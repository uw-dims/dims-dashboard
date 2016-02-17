(function () {
  'use strict';

  function mitigations(MitigationService, $log, $rootScope, $modal) {
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

      $scope.$on('mitigations-changed', function () {
        $log.debug('mitigations.directive received mitigations changed');
        init();
      });

      vm.addMitigation = function addMitigation() {
        $log.debug('add mitigation called');
        // Define modal instance
        $scope.modalInstance = $modal.open({
          templateUrl: '../views/partials/mitigationform.html',
          controller: modalInstanceCtrl
        });

        // Define function which updates with new data
        $scope.modalInstance.result
        .then(function (reply) {
          $log.debug('reply from add mitigation modal', reply);
          getMitigations(vm.trustgroup);
        }, function () {
          $log.debug('add mitigation modal dismissed at: ', new Date());
        });
      };

      var modalInstanceCtrl = function ($scope, $modalInstance) {
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
        $scope.ok = function (msg) {
          $modalInstance.close(msg);
        };
        $scope.submitMitigation = function (result) {
          $log.debug('ips from form are ', result);
          MitigationService.create(result.list, result.name, result.description, $rootScope.currentUser.currentTg)
          .then(function (reply) {
            $scope.ok({
              success: true,
              data: $scope.ipResults
            });
          })
          .catch(function (err) {
            $log.debug('modal reply error', err);
            $scope.ok({
              success: false,
              data: 'An error occurred when submitting your IPs'
            });
          });
        };
      };

    };
  }

  angular
    .module('dimsDashboard.directives')
    .directive('mitigations', mitigations);

  mitigations.$inject = ['MitigationService', '$log', '$rootScope', '$modal'];

}());
