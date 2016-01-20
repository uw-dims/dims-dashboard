(function () {
  'use strict';

  function ticket(TicketService, $log, $rootScope) {
    var directive = {
      restrict: 'AEC',
      templateUrl: 'views/partials/ticket.html',
      controller: controllerFunc,
      controllerAs: 'vm',
      link: linkFunc,
      scope: {
      }
    };

    return directive;

    function linkFunc(scope, el, attr, ctrl) {
      // Don't need this yet
      $log.debug('ticket.directive link function');
    }

    function controllerFunc($scope) {
      var vm = this;

      var init = function init() {
        $log.debug('ticket.directive init. $rootScope.currentUser', $rootScope.currentUser);
        if ($rootScope.currentUser) {
          vm.trustgroup = angular.copy($rootScope.currentUser.currentTg);
          $log.debug('ticket.directive init tg is ', vm.trustgroup);
          TicketService.getTickets(vm.trustgroup)
          .then(function (reply) {
            console.log('reply from getTickets');
            vm.result = reply;
          });
        }
      };

      init();

      $scope.$on('switch-tg', function () {
        $log.debug('ticket.directive received switch-tg');
        init();
      });

    }

  }

  angular
    .module('dimsDashboard.directives')
    .directive('ticket', ticket);

  ticket.$inject = ['TicketService', '$log', '$rootScope'];

}());
