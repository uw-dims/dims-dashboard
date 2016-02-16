(function () {
  'use strict';

  function ticketlist(TicketService, $log, $rootScope) {
    var directive = {
      restrict: 'AEC',
      templateUrl: 'views/partials/ticketlist.html',
      controller: controllerFunc,
      controllerAs: 'vm',
      link: linkFunc,
      scope: {
      }
    };

    return directive;

    function linkFunc(scope, el, attr, ctrl) {
      // Don't need this yet
      $log.debug('ticketList.directive link function');
    }

    function controllerFunc($scope) {
      var vm = this;
      vm.resultsFound = false;
      var init = function init() {
        $log.debug('ticketlist.directive init. $rootScope.currentUser', $rootScope.currentUser);
        if ($rootScope.currentUser) {
          vm.trustgroup = angular.copy($rootScope.currentUser.currentTg);
          $log.debug('ticket.directive init tg is ', vm.trustgroup);
          TicketService.getTickets(vm.trustgroup)
          .then(function (reply) {
            vm.result = reply;
            if (vm.result.length === 0) {
              // No results
              vm.resultsFound = false;
            } else {
              vm.resultsFound = true;
            }
            $log.debug('ticketlist reply from getTickets');
          })
          .catch(function (err) {
            $log.error('ticketlist getTickets: ', err);
          });
        }
      };

      init();

      $scope.$on('switch-tg', function () {
        $log.debug('ticketlists.directive received switch-tg');
        init();
      });
    }

  }

  angular
    .module('dimsDashboard.directives')
    .directive('ticketlist', ticketlist);

  ticketlist.$inject = ['TicketService', '$log', '$rootScope'];

}());
