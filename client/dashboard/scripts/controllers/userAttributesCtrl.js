'use strict';

// File: client/dashboard/scripts/controllers/userAttributesCtrl.js

(function () {

  function UserAttributesCtrl($scope, $rootScope, $log, $location, UserAttributesService) {
    var vm = this;
    var columns = {
      cidr: 4,
      domain: 2,
      tlp: 3
    };

    vm.attributes = {};

    function activate() {
      UserAttributesService.getAttributes($rootScope.currentUser.username)
      .then(function (reply) {
        vm.attributes = reply[$rootScope.currentUser.username];
        vm.cidrRows = format(vm.attributes, UserAttributesService.supportedTypes().cidr, columns.cidr);
        vm.domainRows = format(vm.attributes, UserAttributesService.supportedTypes().domain, columns.domain);
        vm.tlpRows = format(vm.attributes, UserAttributesService.supportedTypes().tlp, columns.tlp);
      });
    }

    activate();

    var format = function format(attributes, type, cols) {
      if (attributes.hasOwnProperty(type)) {
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
