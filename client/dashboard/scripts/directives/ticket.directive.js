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
        data: '='
      }
    };

    return directive;

    function linkFunc(scope, el, attr, ctrl) {
      // Don't need this yet
    }

    function controllerFunc($scope) {
      var vm = this;
      vm.data = angular.copy($scope.data);

      $log.debug('ticket directive controller data is ', vm.data);

      vm.addTopic = function addTopic(ticketKey) {
        $log.debug('addTopic key is ', ticketKey);
      };

      vm.viewTopic = function viewTopic(topicKey) {
        $log.debug('viewTopic key is ', topicKey);
      };

      vm.showDelete = function showDelete() {
        return $rootScope.currentUser.isSysadmin;
      };

    }

  }

  angular
    .module('dimsDashboard.directives')
    .directive('ticket', ticket);

  ticket.$inject = ['TicketService', '$log', '$rootScope'];

}());
