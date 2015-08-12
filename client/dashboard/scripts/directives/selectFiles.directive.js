// File: client/dashboard/scripts/directives/selectFiles.directive.js

(function () {
  'use strict';

  // Plug directive into AngularJS
  angular
    .module('dimsDashboard.directives')
    .directive('dimsSelectFiles', dimsSelectFiles);

  dimsSelectFiles.$inject = ['$timeout', '$log', 'FileService'];

  function dimsSelectFiles($timeout, $log, FileService) {
    var directive = {
      restrict: 'AE',
      templateUrl: 'views/partials/selectFiles.html',
      controller: 'SelectFiles',
      controllerAs: 'vm',
      link: linkFunc,
      scope: {
        fileSource : '@',
        fileType: '@',
        pickerModel: '='
      }
    };

    return directive;

    function linkFunc(scope, el, attr, ctrl) {
      // $log.debug('LINK: scope.fileSource = ', scope.fileSource);
      // $log.debug('LINK: scope.pickerModel = ', scope.pickerModel);
      // $log.debug('LINK: scope.fileType = ', scope.fileType);
      // $log.debug('LINK: scope.vm.fileType = ', scope.vm.fileType);

      scope.$watch('pickerModel', function(newValue, oldValue) {
        // $log.debug('LINK: scope.pickerModel = ', scope.pickerModel);
      });
    }

  }

}());

// EOF
