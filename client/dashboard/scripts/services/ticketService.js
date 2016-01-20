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
