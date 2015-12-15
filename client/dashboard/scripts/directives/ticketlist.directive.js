(function () {
  'use strict';

  function ticketlist(TicketService, $log) {
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

      TicketService.getTickets()
      .then(function (reply) {
        vm.result = reply;
        $log.debug('ticketlist reply from getTickets');
      })
      .catch(function (err) {
        $log.error('ticketlist getTickets: ', err);
      });

    }

  }

  angular
    .module('dimsDashboard.directives')
    .directive('ticketlist', ticketlist);

  ticketlist.$inject = ['TicketService', '$log'];

}());
