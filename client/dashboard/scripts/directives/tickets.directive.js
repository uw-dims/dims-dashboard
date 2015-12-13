(function () {
  'use strict';

  function tickets(TicketService, $log) {
    var directive = {
      restrict: 'AEC',
      templateUrl: 'views/partials/tickets.html',
      controller: controllerFunc,
      controllerAs: 'vm',
      link: linkFunc,
      scope: {
      }
    };

    return directive;

    function linkFunc(scope, el, attr, ctrl) {
      // Don't need this yet
      $log.debug('tickets.directive link function');
    }

    function controllerFunc($scope) {
      var vm = this;

      TicketService.getTickets()
      .then(function (reply) {
        console.log('reply from getTickets');
        vm.result = reply;
      });

    }

  }

  angular
    .module('dimsDashboard.directives')
    .directive('tickets', tickets);

  tickets.$inject = ['TicketService', '$log'];

}());
