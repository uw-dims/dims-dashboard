'use strict';

(function () {

  var TicketApi = function ($resource) {
    return $resource('api/ticket/:id');
  };

  var TicketService = function (TicketApi, $log, $q) {

    var ticketService = {
      getTickets: function () {
        var deferred = $q.defer();
        TicketApi.get({},
          function (resource) {
            $log.debug('TicketService.getMitigation success callback data', resource.data);
            console.log(resource.data);
            deferred.resolve(resource.data);
          },
          function (err) {
            $log.debug('TicketService.geTticket error callback', err);
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
