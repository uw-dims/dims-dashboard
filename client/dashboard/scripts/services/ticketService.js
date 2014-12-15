'use strict';

angular.module('dimsDashboard.services')
  
  .factory('TicketApi', function($resource) {
    return $resource('/api/ticket');
  })

  .factory('TopicApi', function($resource) {
    return $resource('/api/ticket/topic');
  })

  .factory('TicketService', function(TicketApi, $log, $q) {

    var TicketService = {

      data: {},
      tickets: {},

      getTickets: function() {
        $log.debug('TicketService.getTickets start');
        var deferred = $q.defer();
        TicketApi.get({},

        function(resource) {
          $log.debug('TicketService.getTickets success callback data is ', resource.data);
          TicketService.tickets = resource.data;
          deferred.resolve(resource.data);
        },

        function(err) {
          $log.debug('TicketService.getTickets failure callback err is ', err);
          deferred.resolve(err);
        });
        return deferred.promise;
      },

      getTicket: function(ticketKey) {
        $log.debug('TicketService.getTicket start. TicketKey is ', ticketKey);
        TicketApi.get({id: ticketKey},

        function(resource) {
          $log.debug('TicketService.getTicket success callback data is ', resource.data);
         },

        function(err) {
          $log.debug('TicketService.getTicket failure callback err is ', err);
        });
      },

      getTopic: function(topicKey) {

      }

    }

    return TicketService;
  });