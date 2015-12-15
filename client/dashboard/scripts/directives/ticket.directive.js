(function () {
  'use strict';

  function ticket(TicketService, $log) {
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

      TicketService.getTickets()
      .then(function (reply) {
        console.log('reply from getTickets');
        vm.result = reply;
      });

    }

  }

  angular
    .module('dimsDashboard.directives')
    .directive('ticket', ticket);

  ticket.$inject = ['TicketService', '$log'];

}());
