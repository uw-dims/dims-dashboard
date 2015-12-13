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
    }

    function controllerFunc($scope) {
      TicketService.getTickets()
      .then(function (reply) {
        console.log('reply from getTickets');
        $scope.tickets = reply;
      });

    }

  }

  angular
    .module('dimsDashboard.directives')
    .directive('tickets', tickets);

  tickets.$inject = ['TicketService', '$log'];

}());
