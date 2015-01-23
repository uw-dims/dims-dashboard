// File: client/dashboard/scripts/controllers/selectFiles.js

(function () {
  'use strict';

  // Plug controller function into AngularJS
  angular
    .module('dimsDashboard.controllers')
    .controller('SelectFiles', SelectFiles);

  SelectFiles.$inject = ['$scope', 'FileService', '$log'];

  // The controller function for the File Select control
  function SelectFiles($scope, FileService, $log) {
    var vm = this;
    vm.fileList = {};
    vm.fileList.files = [];
    // vm.file.showPicker = false;

    vm.fileSource = $scope.fileSource;
    vm.fileType = $scope.fileType;

    $log.debug('Controller: fileSource is ', vm.fileSource);
    $log.debug('Controller: pickerModel is ', $scope.pickerModel);
    $log.debug('Controller: fileType is ', vm.fileType);

    activate();

    function activate() {

      return FileService.getFileList(vm.fileSource).then(function(result) {
        vm.fileList = result;
        vm.pickerValues = [];
        // Set up picker
        angular.forEach(vm.fileList.files, function(value,key) {
          vm.pickerValues.push({value: vm.fileList.path+value.name, text: value.name})
        });
      });
    }   
  }

}());

// EOF
