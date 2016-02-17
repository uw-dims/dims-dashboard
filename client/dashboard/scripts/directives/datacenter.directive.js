(function () {
  'use strict';

  function datacenter(StixService, TupeloService, UserAttributesService, $log, $rootScope, $modal) {
    var directive = {
      restrict: 'AEC',
      templateUrl: 'views/partials/datacenter.html',
      controller: controllerFunc,
      controllerAs: 'vm',
      link: linkFunc
    };

    return directive;

    function linkFunc(scope, el, attr, ctrl) {
      // Don't need this yet
    }

    function controllerFunc($scope) {
      var vm = this;
      vm.showSourceForm = false;
      vm.showSourceResult = false;
      vm.tlp = '';
      vm.waiting = '';

      UserAttributesService.getAttributes($rootScope.currentUser.username)
      .then(function (reply) {
        $log.debug('getAttributes reply', reply);
        vm.tlp = reply[$rootScope.currentUser.username].tlp[0];
        $log.debug('getAttributes tlp', vm.tlp);
      })
      .catch(function (err) {
        vm.tlp = 'green';
      });

      vm.query = function query() {
        vm.showQueryForm = true;
        vm.showQueryResult = false;
        vm.queryResult = [];
        vm.queryWaiting = '';
      };

      vm.lookupHashes = function lookupHashes(stixResult) {
        vm.showHashResult = false;
        vm.hashWaiting = 'Waiting for response from server';
        console.log(stixResult);
        var hashArray = [];
        if (stixResult.length === 0) {
          return;
        }
        _.forEach(stixResult, function (value) {

          if (value.observableFiles) {
            _.forEach(value.observableFiles, function (item) {
              console.log(item);
              if (item.hashes) {
                console.log('item has hashes', item.hashes);
                if (item.hashes.MD5) {
                  console.log('item has md5', item.hashes.MD5);
                  hashArray.push(item.hashes.MD5);
                }
              }
            });
          } else {
            if (value.hashes) {
              if (value.hashes.hasOwnProperty('MD5')) {
                hashArray.push(value.hashes.MD5);
              }
            } else {
              hashArray.push(value);
            }
          }
          
        });
        $log.debug('hashes are ', hashArray);
        if (hashArray.length > 0) {
          TupeloService.lookupHashes(hashArray)
          .then(function (reply) {
            vm.tupeloData = reply;
            vm.showHashResult = true;
            vm.hashWaiting = '';
            console.log(reply);
          })
          .catch(function (err) {
            $log.error('error in lookupHashes', err.toString());
            vm.hashWaiting = '';
            vm.tupeloData = '';
          });
        } else {
          console.log('no data');
        }
        
      };

      vm.clear = function clear() {
        vm.showSourceResult = false;
        vm.showSourceForm = false;
        vm.stixResult = [];
        vm.tupeloData = '';
        vm.waiting = '';
        vm.hashWaiting = '';
        vm.showHashResult = false;
        vm.showZeroResult = false;
      };

      vm.stix = function stix() {
        vm.showSourceForm = true;
        vm.showSourceResult = false;
        vm.stixResult = [];
        vm.waiting = '';
        vm.hashWaiting = '';
        vm.showHashResult = false;
        vm.showZeroResult = false;
        vm.action = 'fileinfo';
      };

      $scope.uploadedFile = function (element) {
        $log.debug('in uploaded file');
        $log.debug('element', element);
        $log.debug('element.file', element.files);
        $scope.$apply(function ($scope) {
          $scope.files = element.files;
        });
      };

      $scope.addFile = function () {
        $log.debug('in addFile');
        $log.debug('action', vm.action);
        if (vm.action === 'fileinfo' || vm.action === 'md5' || vm.action === 'json') {
          vm.showHashButton = true;
        } else {
          vm.showHashButton = false;
        }
        vm.waiting = 'Waiting for response from server...';
        StixService.uploadFile($scope.files, vm.action, vm.tlp)
        .then(function (reply) {
          console.log(reply);
          vm.showSourceResult = true;
          vm.showSourceForm = false;
          vm.stixResult = reply;
          vm.waiting = '';
          if (vm.stixResult.length === 0) {
            vm.showSourceResult = false;
            vm.showZeroResult = true;
            vm.showHashButton = false;
          }
        })
        .catch(function (err) {
          vm.stixResult = 'There was an error';
          console.log(err.toString());
          vm.waiting = '';
        });
      };
    }
  }
  angular
    .module('dimsDashboard.directives')
    .directive('datacenter', datacenter);

  datacenter.$inject = ['StixService', 'TupeloService', 'UserAttributesService', '$log', '$rootScope', '$modal'];

}());
