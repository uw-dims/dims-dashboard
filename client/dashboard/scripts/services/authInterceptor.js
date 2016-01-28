'use strict';

(function () {

  var authInterceptor = function ($rootScope, $q, $window) {

    var authInterceptor = {
      request: function (config) {
        config.headers = config.headers || {};
        if ($window.sessionStorage.token) {
          // config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
          config.headers.Authorization = 'JWT ' + $window.sessionStorage.token;
        }
        return config;
      },
      response: function (response) {
        if (response.status === 401) {
          // handle the case where the user is not authenticated
          console.log('authInterceptor response is 401');
        }
        return response || $q.when(response);
      }
    };

    return authInterceptor;

  };

  angular.module('dimsDashboard.services')
  .factory('authInterceptor', authInterceptor);

  authInterceptor.$inject = ['$rootScope', '$q', '$window'];

}());
