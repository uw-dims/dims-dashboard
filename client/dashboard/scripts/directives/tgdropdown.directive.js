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
      vm.bob = 'Bob';
      $log.debug('in tgdropdown controller');

      var updateScope = function updateScope() {
        vm.currentUser = angular.copy($rootScope.currentUser);
        vm.tgs = getTgs(vm.currentUser);
        vm.currentTg = vm.currentUser.trustgroups[vm.currentUser.currentTg].tgDescription;
      };

      vm.switchTg = function switchTg (tg) {
        // update value of currentTg in rootScope and propagate
        $rootScope.currentUser.currentTg = tg.name;
        updateScope();
        // notify other scopes that might depend on tg
        $rootScope.$broadcast('switch-tg');
        $log.debug('vm.currentUser', vm.currentUser);
        $log.debug('vm.tgs', vm.tgs);
        $log.debug('vm.currentTg', vm.currentTg);
        $log.debug('rootScope.currentUser', $rootScope.currentUser);
        // update settings
        var settings = SettingsService.get();
        settings.currentTg = tg.name;
        SettingsService.update(settings).then(function (resource) {
          $log.debug('success setting, data is ', resource.data);
        }).catch(function (err) {
          $log.debug('setUserSettings error', err);
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
