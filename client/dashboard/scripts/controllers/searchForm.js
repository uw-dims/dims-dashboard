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
