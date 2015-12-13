(function () {
  'use strict';

  function mitigation(MitigationService, $log) {
    var directive = {
      restrict: 'AEC',
      templateUrl: 'views/partials/mitigation.html',
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

      var getGraphOptions = function getGraphOptions(metadata) {
        var options = {
          xLabel: 'Time',
          yLabel: 'Total IPs Mitigated',
          key: 'Total IPs',
          withFocus: false,
          yMax: metadata.initialNum,
          yMin: 0
        };
        $log.debug('vm.getGraphOptions', options);
        return options;
      };

      var addOptions = function addOptions(data) {
        var result = [];
        _.forEach(data, function (value, index) {
          value.graphOptions = getGraphOptions(value.metadata);
          result.push(value);
        });
        return data;
      };

      var init = function init() {
        vm.showProgress = true;
        vm.showMyIps = false;
        MitigationService.getMitigation()
        .then(function (reply) {
          vm.data = addOptions(reply);
          $log.debug('vm.data is ', vm.data);
          $log.debug('getMitigation vm.data is ', vm.data);
          $log.debug('getMitigation vm.options is ', vm.options);
        });
      };

      init();

      vm.updateMitigation = function updateMitigation() {

      };

    }
  }

  angular
    .module('dimsDashboard.directives')
    .directive('mitigation', mitigation);

  mitigation.$inject = ['MitigationService', '$log'];

}());
