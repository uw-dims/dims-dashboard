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

  // Plug directive into AngularJS
  angular
    .module('dimsDashboard.directives')
    .directive('dimsSelectFiles', dimsSelectFiles);

  dimsSelectFiles.$inject = ['$timeout', '$log', 'FileService'];

}());

// EOF
