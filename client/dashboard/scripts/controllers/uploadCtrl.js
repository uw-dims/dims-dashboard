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
'use strict';
angular.module('dimsDashboard.controllers').
  controller ('UploadCtrl', ['$scope', '$http', '$timeout', '$upload', 'Utils', 'SettingsService',
    function($scope, $http, $timeout, $upload, Utils, SettingsService) {
console.log('In UploadController');

  $scope.usingFlash = FileAPI && FileAPI.upload !== null;
  $scope.fileReaderSupported = window.FileReader !== null && (window.FileAPI === null || FileAPI.html5 !== false);

  // Setup form data
    $scope.formData = {};
    $scope.destinationMap = constants.fileDestinationMap;
    $scope.formData.destination = $scope.destinationMap[0].value;
    $scope.showFilesToUpload = false;

  $scope.hasUploader = function(index) {
    return $scope.upload[index] !== undefined;
  };
  $scope.abort = function(index) {
    $scope.upload[index].abort();
    $scope.upload[index] = null;
  };

  $scope.onFileSelect = function($files) {
    $scope.selectedFiles = [];
    $scope.progress = [];
    $scope.progressClass = [];
    $scope.fileResponseClass = [];

   // $scope.showFilesToUpload = true;

    // Check for files that haven't finished uploading
    if ($scope.upload && $scope.upload.length > 0) {
      for (var i = 0; i < $scope.upload.length; i++) {
        if ($scope.upload[i] !== null) {
          $scope.upload[i].abort();
        }
      }
    }
    $scope.upload = [];
    $scope.uploadResult = [];
    $scope.selectedFiles =  $files;
    $scope.newName = [];
    $scope.dataUrls = [];

    var numFiles = $files.length > constants.maxFileUpload ? constants.maxFileUpload : $files.length;

    for (var j = 0; j < numFiles; j++) {
      var $file = $files[j];
      if ($scope.fileReaderSupported && $file.type.indexOf('image') > -1) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL($files[j]);
        var loadFile = function(fileReader, index) {
            fileReader.onload = function(e) {
                $timeout(function() {
                $scope.dataUrls[index] = e.target.result;
              });
            };
        }(fileReader, j);
      }
      $scope.progress[j] = -1;
      $scope.progressClass[j] = '';
      $scope.fileResponseClass[j] = 'file-response';
      $scope.uploadResult[j] = '';
    }
  };

  $scope.start = function(index) {

    $scope.progress[index] = 1;
    $scope.errorMsg = null;

    var data = {};
    data.destination = $scope.formData.destination;
    if ($scope.newName[index] !== undefined) {
      data.newName = $scope.newName[index];
    }

    $scope.upload[index] = $upload.upload({
      url: '/upload',
      method: 'POST',
      data: data,
      file: $scope.selectedFiles[index],
      fileFormDataName: 'file'
    });

    $scope.upload[index].then(function(response) {
      $timeout(function() {
        $scope.uploadResult[index] = response.data.msg + '. Filename: ' + response.data.filename + '. Location: ' + response.data.path;
      });

    },
      function(response) {
        if (response.status > 0) {
          $scope.progress[index] = 0;
          $scope.uploadResult[index] = 'Error: ' +response.status+ ': '+response.data.msg;
          $scope.progressClass[index] = 'progress-fail';
          $scope.fileResponseClass[index] = 'file-response-fail';
        }
    },
      function(evt) {
        // Math.min is to fix IE which reports 200% sometimes
        $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });

    $scope.upload[index].xhr(function(xhr) {
      xhr.upload.addEventListener('abort', function() {console.log('abort complete');}, false);
    });

  };

 $scope.dragOverClass = function($event) {
    var items = $event.dataTransfer.items;
    var hasFile = false;
    if (items !== null) {
      for (var i = 0 ; i < items.length; i++) {
        if (items[i].kind === 'file') {
          hasFile = true;
          break;
        }
      }
    } else {
      hasFile = true;
    }
    return hasFile ? 'uploadDropzone-hover' : 'uploadDropzone-hover-err';
  };
}]);
