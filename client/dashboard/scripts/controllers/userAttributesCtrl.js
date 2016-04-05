/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

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
        return result;
      }
      return items;
    };

    vm.update = function update(type, addItems, removeItems) {
     
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
