
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
