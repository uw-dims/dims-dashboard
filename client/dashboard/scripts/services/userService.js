'use strict';


angular.module('dimsDashboard.services')

  .factory('UserApi', function ($resource) {
    return $resource('/api/user/:id');
  });
