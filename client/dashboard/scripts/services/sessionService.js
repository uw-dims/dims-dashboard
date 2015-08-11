'use strict';

angular.module('dimsDashboard.services')

  .factory('SessionService', function ($resource) {
    return $resource('/auth/session');
  });
