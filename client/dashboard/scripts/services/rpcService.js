'use strict';

// File: client/dashboard/js/services/rpcService.js

/**
 * This file contains factories for calling server endpoints for rwfind, cifbulk, 
 * crosscor, and anon clients.
 */

angular.module('dimsDashboard.services')

  .factory('CifbulkApi', function($resource) {
      return $resource('/cifbulk');
  })

  .factory('AnonApi', function($resource) {
      return $resource('/anon');
  })

  .factory('RwfindApi', function($resource) {
      return $resource('/rwfind');
  })

  .factory('CrosscorApi', function($resource) {
      return $resource('/crosscor');
  });