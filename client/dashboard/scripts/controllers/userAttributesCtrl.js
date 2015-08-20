'use strict';

// File: client/dashboard/scripts/controllers/userAttributesCtrl.js

(function () {

  function UserAttributesCtrl($scope, $rootScope, $log, $location, UserAttributesService) {
    var vm = this;
    var columns = {
      cidr: 4,
      domain: 1,
      tlp: 1
    };

    vm.attributes = {};

    function activate() {
      UserAttributesService.getAttributes($rootScope.currentUser.username)
      .then(function (reply) {
        vm.attributes = reply;
        $log.debug('UserAttributeCtrl activate reply is ', vm.attributes);
        $log.debug('cidr is ', UserAttributesService.supportedTypes().cidr);
        vm.cidrRows = format(vm.attributes, UserAttributesService.supportedTypes().cidr, columns.cidr);
      });
    }

    activate();

    var format = function format(attributes, type, cols) {
      $log.debug('type is ', type);
      $log.debug('attributes is ', attributes);
      $log.debug('cols is ', cols);
      if (attributes.hasOwnProperty(type)) {
        $log.debug('cidr atts is ', attributes[type]);
        return UserAttributesService.formatAttribute(attributes[type], cols);
      } else {
        return [];
      }
    };

  }

  // Plug controller function into AngularJS
  angular
    .module('dimsDashboard.controllers')
    .controller('UserAttributesCtrl', UserAttributesCtrl);

  UserAttributesCtrl.$inject = ['$scope', '$rootScope', '$log', '$location', 'UserAttributesService'];

}());
