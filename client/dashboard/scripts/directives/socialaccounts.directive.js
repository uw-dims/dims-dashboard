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

  function socialAccounts($log, AuthService) {
    var directive = {
      restrict: 'AEC',
      templateUrl: 'views/partials/socialaccounts.html',
      controller: controllerFunc,
      controllerAs: 'vm',
      link: linkFunc,
      scope: {

      }
    };
    return directive;
    function linkFunc(scope, el, attr, ctrl) {
      // Don't need this yet
    }

    function controllerFunc($scope) {
      $log.debug('accounts directive controller');
      // Controls whether or not to show the link to connect
      // We currently only connect one account
      var vm = this;
      vm.showConnect = false;
      vm.showMessage = false;
      vm.numAccounts = 0;
      vm.tokenMessage = 'Display token';
      vm.showToken = false;
      vm.message = '';
      getAccounts();

      vm.disconnect = function disconnect(index) {
        $log.debug('socialAccounts disconnect index', index);
        AuthService.disconnectSocialAccount(vm.accounts[index].service, function (err) {
          if (err) {
            vm.message = 'The account could not be disconnected. ';
            vm.showMessage = true;
            $log.error('accounts.directive error', err);
          } else {
            vm.message = 'The account was disconnected. ';
            vm.showMessage = true;
          }
          getAccounts();
        });
      };

      vm.getToken = function getToken() {
        if (vm.showToken) {
          vm.tokenMessage = 'Display token';
          vm.showToken = false;
          vm.token = '';
        } else {
          vm.tokenMessage = 'Hide token';
          vm.showToken = true;
          vm.token = AuthService.showToken();
        }
      };

      function getAccounts() {
        AuthService.getSocialAccounts(function (err) {
          if (err) {
            vm.message += err;
            vm.showMessage = true;
            $log.error('accounts.directive error', err);
          } else {
            vm.accounts = AuthService.socialAccounts;
            if (vm.accounts.length === 0) {
              vm.message += 'You are not connected to any social accounts.';
              vm.showMessage = true;
              vm.showConnect = true;
            } else {
              vm.showConnect = false;
              vm.numAccounts = vm.accounts.length;
            }
            $log.debug('accounts directive. AuthService.accounts are', vm.accounts);
          }
        });
      }

    }
  }

  angular
    .module('dimsDashboard.directives')
    .directive('socialAccounts', socialAccounts);

  socialAccounts.$inject = ['$log', 'AuthService'];

}());
