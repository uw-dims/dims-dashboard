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

'use strict';

(function () {

  var TicketApi = function ($resource) {
    return $resource('api/ticket/:id', {
      id: '@id'
    }, {
      update: {
        method: 'PUT',
        url: 'api/ticket/:id'
      }
    });
  };

  var TicketService = function (TicketApi, $log, $q) {

    var ticketService = {
      getTickets: function (tg) {
        $log.debug('TicketService.getTickets tg is ', tg);
        var deferred = $q.defer();
        TicketApi.get({
          type: 'activity',
          tg: tg
        },
          function (resource) {
            $log.debug('TicketService.getTickets success callback data', resource.data);
            console.log(resource.data.tickets);
            var result = resource.data.tickets.reverse();
            deferred.resolve(result);
          },
          function (err) {
            $log.debug('TicketService.getTickets error callback', err);
            deferred.reject(err);
          });
        return deferred.promise;
      },
      deleteTicket: function (id) {
        $log.debug('TicketService.deleteTickets id is ', id);
        var deferred = $q.defer();
        TicketApi.delete({
          id: id
        },
          function (resource) {
            $log.debug('TicketService.deleteTicket success callback ', resource);
            deferred.resolve('ok');
          },
          function (err) {
            $log.debug('TicketService.deleteTicket error callback', err);
            deferred.reject(err);
          });
        return deferred.promise;
      }
    };

    return ticketService;

  };

  angular.module('dimsDashboard.services')
  .factory('TicketApi', TicketApi)
  .factory('TicketService', TicketService);

  TicketApi.$inject = ['$resource'];
  TicketService.$inject = ['TicketApi', '$log', '$q'];

}());
