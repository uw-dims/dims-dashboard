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
(function () {
  'use strict';

  function tgDropdown($log, $rootScope, SettingsService) {
    var directive = {
      restrict: 'AEC',
      template: '<a href="#" class="dropdown-toggle" data-toggle="dropdown">' +
       '{{vm.currentTg}} <span class="caret"></span></a> ' +
        '<ul class="dropdown-menu" role="menu"> ' +
          '<li ng-repeat="n in vm.tgs"><a ng-click="vm.switchTg(n)"> ' +
            ' {{n.description}}</a></li> ' +
        '</ul>',
      controller: controllerFunc,
      controllerAs: 'vm',
      link: linkFunc,
      scope: {
      }
    };

    var template ='<a href="#" class="dropdown-toggle" data-toggle="dropdown">' +
       '{{vm.currentTg}} <span class="caret"></span></a> ' +
        '<ul class="dropdown-menu" role="menu"> ' +
          '<li ng-repeat="n in vm.tgs"><a ng-click="vm.switchTg(n)"> ' +
            ' {{vm.currentUser.trustgroups[n].tgDescription}}</a></li> ' +
        '</ul>';

    return directive;

    function linkFunc(scope, el, attr, ctrl) {
      // Don't need this yet
    }

    function controllerFunc($scope) {
      var vm = this;

      var updateScope = function updateScope() {
        vm.currentUser = angular.copy($rootScope.currentUser);
        vm.tgs = getTgs(vm.currentUser);
        vm.currentTg = vm.currentUser.trustgroups[vm.currentUser.currentTg].tgDescription;
      };

      vm.switchTg = function switchTg(tg) {
        // update value of currentTg in rootScope and propagate
        $rootScope.currentUser.currentTg = tg.name;
        updateScope();
        // notify other scopes that might depend on tg
        $rootScope.$broadcast('switch-tg');
        var settings = SettingsService.get();
        // Update settings with current trust group id
        settings.currentTg = tg.name;
        SettingsService.update(settings).then(function (resource) {
          $log.debug('tgdropdown.switchTg success setting, data is ', resource.data);
        }).catch(function (err) {
          $log.debug('tgdropdown.switchTg setUserSettings error', err);
        });
      };

      var getTgs = function getTgs(currentUser) {
        var tgs = [];
        _.forEach(currentUser.loginTgs, function (value) {
          if (currentUser.currentTg !== value) {
            tgs.push({
              description: currentUser.trustgroups[value].tgDescription,
              name: value
            });
          }
        });
        return tgs;
      };

      $rootScope.$on('currentUser-ready', function () {
        $log.debug('tgdropdown received currentUser-ready');
        updateScope();
      });

    }

  }

  angular
    .module('dimsDashboard.directives')
    .directive('tgDropdown', tgDropdown);

  tgDropdown.$inject = ['$log', '$rootScope', 'SettingsService'];

}());
