'use strict';

// File: client/dashboard/scripts/controllers/userAttributesCtrl.js

(function () {

  function UserAttributesCtrl($scope, $rootScope, $log, $location, $q, UserAttributesService) {
    var vm = this;
    var columns = {
      cidr: 4,
      domain: 2,
      tlp: 1
    };

    vm.types = UserAttributesService.supportedTypes();
    vm.editOn = function editOn(type) {
      vm.edit[type] = true;
    };
    vm.editOff = function editOff(type) {
      vm.edit[type] = false;
      vm.items[type] = [];
    };

    vm.attributes = {};
    vm.edit = {};
    vm.items = {};
    vm.items[vm.types.cidr] = intializeItems(vm.types.cidr);
    vm.items[vm.types.domain] = intializeItems(vm.types.domain);
    vm.editOff(vm.types.cidr);
    vm.editOff(vm.types.domain);

    function activate() {
      UserAttributesService.getAttributes($rootScope.currentUser.username)
      .then(function (reply) {
        vm.attributes = reply[$rootScope.currentUser.username];
        vm.cidrRows = format(vm.attributes, vm.types.cidr, columns.cidr);
        vm.domainRows = format(vm.attributes, vm.types.domain, columns.domain);
        vm.tlpRows = format(vm.attributes, vm.types.tlp, columns.tlp);
      });
    }

    activate();

    function intializeItems(type) {
      return {
        addItems: [],
        removeItems: ''
      };
    };

    var getItems = function (items) {
      $log.debug('items in getItems are ', items);
      if (items === undefined || items === '') {
        return [];
      }
      if (!Array.isArray(items)) {
        var result = [];
        items = items.split(/\n/);
        _.forEach(items, function (value, index) {
          var newArray = value.split(' ');
          _.forEach(newArray, function (value, index) {
            result.push(_.trim(value));
          });
        });
        $log.debug('result is ', result);
        return result;
      }
      return items;
    };

    vm.update = function update(type, addItems, removeItems) {
      $log.debug('addItems initially ', addItems);
      $log.debug('removeItems initially ', removeItems);
      var promises = [];
      var toAdd = getItems(addItems);
      var toRemove = getItems(removeItems);
      $log.debug('addItems now', toAdd);
      $log.debug('removeItems now', toRemove);
      if (toAdd.length !== 0) {
        promises.push(UserAttributesService.updateAttribute($rootScope.currentUser.username, type, 'add', toAdd));
      }
      if (toRemove.length !== 0) {
        promises.push(UserAttributesService.updateAttribute($rootScope.currentUser.username, type, 'remove', toRemove));
      }
      $q.all(promises)
      .then(function (reply) {
        $log.debug('update reply', reply);
        activate();
        vm.items[type] = intializeItems(vm.types[type]);
        vm.editOff(type);
      })
      .catch(function (err) {
        $log.error (err);
      });
    };
    vm.cancel = function cancel(type) {
      vm.items[vm.types[type]] = intializeItems(vm.types[type]);
      vm.editOff(type);
    };

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

  UserAttributesCtrl.$inject = ['$scope', '$rootScope', '$log', '$location', '$q', 'UserAttributesService'];

}());
