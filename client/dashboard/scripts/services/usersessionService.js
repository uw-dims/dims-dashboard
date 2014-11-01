'use strict';

angular.module('dimsDashboard.services')
  
  .factory('UsersessionService', function($resource) {
    return $resource('/settings');
  });