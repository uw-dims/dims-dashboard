// 'use strict';

// angular.module('dimsDashboard.services')

  // .factory('TicketApi', function($resource) {
  //   return $resource('/api/ticket/:id');
  // })

  // .factory('TopicApi', function($resource) {
  //   return $resource('/api/ticket/topic/:id');
  // })

  // .factory('TicketUtils', function($log) {

  //   var TicketUtils = {
  //     parseTicketList: function(tickets) {
  //       var list = [];
  //       angular.forEach(tickets, function(ticket, key) {
  //         var ticketKeyArray = ticket.split(':'); // Split on :
  //         list.push({name: 'DIMS-'+ticketKeyArray[1], num:ticketKeyArray[1], key:ticket, selected: ''});
  //       });
  //       return list;
  //     },
  //     parseTicketObject: function(ticketObject) {
  //       $log.debug('TicketUtils.parseTicketObject. Object is ', ticketObject);
  //       var list = [];
  //       var type = _.capitalize(ticketObject.ticket.type);
  //       var ticketKey = ticketObject.key;
  //       angular.forEach(ticketObject.topics, function(topicKey,key) {
  //         var topicKeyArrayConfig = {};
  //         topicKeyArrayConfig.type = type;
  //         topicKeyArrayConfig.ticketKey = ticketKey;
  //         var index = ticketKey.length + type.length + 2
  //         topicKeyArrayConfig.name = topicKey.substring(index, topicKey.length);
  //         topicKeyArrayConfig.topicKey = topicKey;
  //         list.push(topicKeyArrayConfig);
  //       });
  //       ticketObject.topics = list; //replace the original list
  //       ticketObject.ticket.type = type; // replace with capitalized for display
  //       return ticketObject;
  //     }
  //   }
  //   return TicketUtils;

  // })

  // .factory('TicketService', function (TicketApi, TopicApi, TicketUtils, $log, $q) {

  //   var TicketService = {

  //     data: {},
  //     tickets: {},

  //     // Get array of existing ticket keys from rest api
  //     getTickets: function () {
  //       $log.debug('TicketService.getTickets start');
  //       var deferred = $q.defer();
  //       TicketApi.get({},

  //       function (resource) {
  //         $log.debug('TicketService.getTickets success callback data is ', resource.data);
  //         deferred.resolve(resource.data);
  //         // var list = TicketUtils.parseTicketList(resource.data);
  //         // $log.debug('TicketService.getTickets parsed list is ', list);
  //         // TicketService.tickets = list; // not sure if we'll need this or not
  //         // deferred.resolve(list);
  //       },

  //       function (err) {
  //         $log.debug('TicketService.getTickets failure callback err is ', err);
  //         deferred.resolve(err);
  //       });
  //       return deferred.promise;
  //     },

  //     // Get one ticket - key, ticket metadata, array of topic keys
  //     getTicket: function (ticketKey) {
  //       $log.debug('TicketService.getTicket start. TicketKey is ', ticketKey);
  //       var deferred = $q.defer();
  //       TicketApi.get({id: ticketKey},

  //       function (resource) {
  //         $log.debug('TicketService.getTicket success callback data is ', resource.data);
  //         deferred.resolve(resource.data)
  //         // Massage the topic list in the ticket
  //         // var parsedTicket = TicketUtils.parseTicketObject(resource.data);
  //         // $log.debug('TicketService.getTicket parsed ticket object is ', parsedTicket);
  //         // deferred.resolve(parsedTicket);
  //        },

  //       function (err) {
  //         $log.debug('TicketService.getTicket failure callback err is ', err);
  //         deferred.reject(err);
  //       });
  //       return deferred.promise;
  //     },

  //     getTopic: function (topicKey) {
  //       $log.debug('TicketService.getTopic start. TopicKey is ', topicKey);
  //       var deferred = $q.defer();
  //       TopicApi.get({id: topicKey},

  //       function (resource) {
  //         $log.debug('TicketService.getTopic success callback data is ', resource.data);
  //         var jsonData;
  //         resource.data.content.mitigationData = false;
  //         resource.data.content.mitigationType = 'set';
  //         resource.data.content.responseType = 'txt';

  //         if (topicKey.indexOf("mitigation") > -1) {
  //           resource.data.mitigationData = true;
  //           resource.data.responseType = 'mitigation';
  //           if (topicKey.indexOf("mitigation:data")) {
  //             resource.data.mitigationType = 'zset';
  //           }
  //         }

  //         try {
  //           jsonData = JSON.parse(resource.data.content.data);
  //           resource.data.content.data = jsonData;
  //           resource.data.content.responseType = 'json';
  //         } catch (e) {
  //           $log.debug('TicketService.getTopic data is not json');
  //         }
  //         $log.debug('TicketService.getTopic data response type is ', resource.data.content.responseType);

  //         deferred.resolve(resource.data);


  //       },

  //       function (err) {
  //         $log.debug('TicketService.getTopic failure callback err is ', err);
  //         deferred.reject(err);
  //       });
  //       return deferred.promise;

  //     }

  //   }

  //   return TicketService;
  // });