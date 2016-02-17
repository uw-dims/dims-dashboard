'use strict';

(function () {

  var StixService = function ($http, $log, $q) {

    var stixService = {};

    stixService.uploadFile = function (files, action, tlp, success, error) {
      var url = '/api/stix';
      console.log('file', files);
      var fd = new FormData();

      var data = {
        action: action,
        tlp: tlp
      };

      $log.debug('stixService.uploadFile data is ', data);

        var deferred = $q.defer();
         fd.append('file', files[0]);

         fd.append('data', JSON.stringify(data));

          $http.post(url, fd, {
            headers: {
              'Content-Type' : undefined
            },
            transformRequest: angular.identity
          })
          .success(function (reply) {
            console.log('data is ', reply);
            var result = JSON.parse(reply.data[data.action]);
            console.log(result);
            return deferred.resolve(result);

          })
          .error(function (err) {
            console.log('error is ', err);
            return deferred.resolve(err)
          });

          return deferred.promise;

    };

    return stixService;

  }

  angular
    .module('dimsDashboard.services')
    .factory('StixService', StixService);

  StixService.$inject = ['$http', '$log', '$q']

}());
