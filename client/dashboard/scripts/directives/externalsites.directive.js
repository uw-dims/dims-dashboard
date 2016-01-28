(function () {
  'use strict';

  function externalSites($log, $window, $modal, SettingsService) {
    var directive = {
      restrict: 'AEC',
      templateUrl: 'views/partials/externalsites.html',
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
      $log.debug('externalsites directive controller');
      var vm = this;
      var staticExternals = [];
      var colors = ['#53a07f', '#86b3bb', '#716F84', '#1D6285', '#3d765d', '#424557'];
      var maxSites = 12;
      // TODO Add this info to system configuration database
      staticExternals.push({
        externalKey: 'consul',
        siteName: 'SYSTEM STATUS',
        siteURL: 'http://10.142.29.117:8500/ui/#/dc1/nodes',
        canDelete: false
      });
      staticExternals.push({
        externalKey: 'trident',
        siteName: 'Trident',
        siteURL: 'https://demo.trident.li/',
        canDelete: false
      });
      vm.allSites = getAllSites(staticExternals);
      var associatedSites = sitesConfig(vm.allSites);
      vm.showAdd = vm.allSites.length < maxSites ? true : false;

      vm.w = {};
      vm.openSite = function openSite(id) {
        if (!vm.w[id] || vm.w[id].closed) {
          vm.w[id] = $window.open(associatedSites[id], "_blank");
        } else {
          $log.debug('External sites window', id, 'is already opened');
        }
        vm.w[id].focus();
      };

      vm.boxColors = (function (maxSites, colors) {
        var result = [];
        for (var i = 0; i < maxSites; i++) {
          result.push(colors[i % colors.length]);
        }
        return result;
      })(maxSites, colors);

      $log.debug('externalsites boxColors ', vm.boxColors);

      vm.openAddForm = function openAddForm() {
        $log.debug('in openAddForm');
        vm.modalInstance = $modal.open({
          templateUrl: '../views/partials/addSites.html',
          controller: modalInstanceCtrl
        });
        vm.modalInstance.result
        .then(function (reply) {
          $log.debug('externalsites reply from modal', reply);
          vm.addSite(reply.data);
        }, function () {
          $log.debug('externalsites modal dismissed at: ', new Date());
        });
      };

      var modalInstanceCtrl = function ($scope, $modalInstance) {
        $scope.title = 'Add new site';
        $scope.formData = {};
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
        $scope.ok = function (msg) {
          $modalInstance.close(msg);
        };
        $scope.submit = function (formData) {
          $log.debug('data from submit is ', formData);
          $scope.ok({
            success: true,
            data: formData
          });
        };
      };

      vm.addSite = function addSite(formData) {
        $log.debug('addSite. formData is ', formData);
        $log.debug('name is ', formData.name);
        vm.message = '';
        // need some input validation
        var newSite = {
          externalKey: formData.name.replace(/\s+/g, ''),
          siteName: formData.name.toUpperCase(),
          siteURL: formData.url,
          canDelete: true
        };
        var settings = SettingsService.get();
        settings.userExternals.push(newSite);
        SettingsService.update(settings).then(function (resource) {
          vm.allSites = getAllSites(staticExternals);
          associatedSites = sitesConfig(vm.allSites);
          vm.showAdd = vm.allSites.length < maxSites ? true : false;
        }).catch(function (err) {
          $log.debug('addSite error', err);
          vm.message = 'There was an error adding the new site';
        });
      };

      vm.removeSite = function removeSite(key) {
        vm.message = '';
        var settings = SettingsService.get();
        _.remove(settings.userExternals, function (value) {
          return value.externalKey === key;
        });
        SettingsService.update(settings).then(function (resource) {
          $log.debug('removeSite success saving updated settings, ', resource.data);
          vm.allSites = getAllSites(staticExternals);
          associatedSites = sitesConfig(vm.allSites);
          vm.showAdd = vm.allSites.length < maxSites ? true : false;
        }).catch(function (err) {
          $log.debug('addSite error', err);
          vm.message = 'There was an error removing the new site';
        });
      };

      // Build config of sites from an externals array
      function sitesConfig(externals) {
        var config = {};
        _.forEach(externals, function (value) {
          config[value.externalKey] = value.siteURL;
        });
        return config;
      }

      // Return an array of all Sites
      function getAllSites(staticSites) {
        var result = [];
         _.forEach(staticSites, function (value) {
          result.push(value);
        });
        _.forEach(SettingsService.get().userExternals, function (value) {
          result.push(value);
        });
        return result;
      }
    }

  }

  angular
    .module('dimsDashboard.directives')
    .directive('externalSites', externalSites);

  externalSites.$inject = ['$log', '$window', '$modal', 'SettingsService'];

}());
