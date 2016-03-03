/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
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

      vm.deleteTicket = function deleteTicket(ticketKey) {
        $log.debug('deleteTicket key is ', ticketKey);
      };

    }

  }

  angular
    .module('dimsDashboard.directives')
    .directive('ticket', ticket);

  ticket.$inject = ['TicketService', '$log', '$rootScope'];

}());
