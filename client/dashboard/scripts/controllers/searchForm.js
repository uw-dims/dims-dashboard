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

  // Plug controller function into AngularJS
  angular
    .module('dimsDashboard.controllers')
    .controller('SearchForm', SearchForm);

  SearchForm.$inject = ['$scope', '$log'];

  // The controller function for the File Select control
  function SearchForm($scope, $log) {
    var vm = this;

    // Array of formData possibilities
    var formDataArray = [
      'startDateTime', 'endDateTime', 'numDays', 'hitLimit', 'header', 'ips', 'fileName',
      'upload', 'mapName', 'stats', 'iff', 'outputType'
    ];

    // Map of formData items used for each type of tool
    var queryItems = {
      'rwfind': ['startDateTime', 'endDateTime', 'numDays', 'hitLimit', 'header', 'ips', 'fileName', 'outputType'],
      'cifbulk': ['ips', 'fileName', 'upload'],
      'crosscor': ['fileName', 'mapName', 'stats', 'iff'],
      'anon': ['fileName', 'mapName', 'outputType', 'stats']
    };

    // Populates outputType picker
    vm.outputTypes = [{
        value: 'json',
        label: 'JSON'
      },{
        value: 'text',
        label: 'TEXT'
      }];

    // Populates iff picker
    vm.iffs = [{
        value: 'friend',
        label: 'Friend'
      },{
        value: 'foe',
        label: 'Foe'
      }];

    vm.tooltips = {
      date: 'YYYY-MM-DD or YYY-MM-DDThh:mm:ssTZD, where TZD is time zone designator',
      htmlDate: 'Examples: 2014-07-29 <br/>2014-07-29T07:52:36Z<br/>2014-07-29T02:52:36-05:00'
    };

    // Initialize formData
    vm.formData = {};
    // Initialize show - controls what form controls are visible
    vm.show = {};
    // Get the tool from scope
    vm.tool = $scope.tool;
    // Unwrap callback
    vm.callback = $scope.callback();
    // Set to show left column - TODO refactor
    vm.showLeftCol = (vm.tool.name === 'rwfind');
    // Query items that belong to this tool
    var toolQueryItems = queryItems[vm.tool.name];
    // Function to set properties to false
    var initializeShow = setShowFactory(false);
    // Function to set properties to true
    var turnOnShow = setShowFactory(true);
    // Set all vm.show initial properties to false
    angular.forEach(formDataArray, function(value, index) {
      initializeShow(vm.show, value);
    });
    // Set vm.show properties to true for the tool's form data
    angular.forEach(toolQueryItems, function(value, index) {
      turnOnShow(vm.show, value);
    });

    $log.debug('searchForm turned on show values, tool.name, show is ', vm.tool.name, vm.show);
    $log.debug('searchForm tool is ', vm.tool);

    activate();

    function activate() {
      // No activation needed for this controller
    }
    // Returns function to set properties of an object
    function setShowFactory(value) {
      return function(base, type) {
        base[type] = value;
      }
    }

    function validateFormFactory(fieldsToValidate) {
      return function(formData) {

      }
    }

    function shouldHaveOneInput(formData) {
      var badData = false,
          errMsg = '';
      if (!Utils.inputPresent(formData.ips) && !Utils.inputPresent(formData.fileName)) {
        badData = true;
        errMsg = 'You have to either choose a file or enter the input data manually in the textarea';
      } else if (Utils.inputPresent(formData.ips) && Utils.inputPresent(formData.fileName)) {
        badData = true;
        errMsg = 'You have to either choose a file or enter input data. You cannot do both';
      }
      return { hasError: badData, errMsg: errMsg };
    }
  }

}());

// EOF
