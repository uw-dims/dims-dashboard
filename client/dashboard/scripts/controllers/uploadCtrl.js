'use strict';
angular.module('dimsDashboard.controllers').
  controller ('UploadCtrl', ['$scope', '$upload', 'Utils', function($scope, $upload, Utils) {
console.log('In UploadController');
  // Setup form data
    $scope.formData = {};
    $scope.destinationMap = constants.fileDestinationMap;
    $scope.formData.destination = $scope.destinationMap[0].value;
    $scope.showFilesToUpload = false;

  $scope.hasUploader = function(index) {
    return $scope.upload[index] !== null;
  };
  $scope.abort = function(index) {
    $scope.upload[index].abort(); 
    $scope.upload[index] = null;
  };

  $scope.onFileSelect = function($files) {
    $scope.files =  $files;
    console.log('set files');
    console.log($scope.files);
    $scope.progress = [];

    $scope.showFilesToUpload = true;

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
    $scope.selectedFiles = $files;
    $scope.uploadData = [];
    for (var j = 0; j < $files.length; j++) {
      $scope.progress[j] = -1;
      // $scope.uploadData[j].newName = "";
      // $scope.uploadData[j].fileType = "";
      // $scope.uploadData[j].desc = "";
      // $scope.uploadData[j].destination = $scope.formData.destination;
      $scope.uploadData.push({
        newName: '',
        fileType: '',
        desc: '',
        destination: $scope.formData.destination
      });
    }
  };

  $scope.start = function(index) {

    $scope.progress[index] = 0;
    $scope.errorMsg = null;

    console.log($scope.uploadData[index]);
    console.log($scope.selectedFiles[index]);

    $scope.upload[index] = $upload.upload({
      url: '/upload',
      data: $scope.uploadData[index],
      file: $scope.selectedFiles[index]
    }).then(function(response) {
      $scope.uploadResult.push(response.data);
      console.log($scope.uploadResult);
      console.log(response);
    }, 
      function(response) {
        console.log(response.status);
        if (response.status > 0) { 
          $scope.errorMsg = response.status+ ': '+response.data;
          $scope.uploadResult.push(response.data);
        }
    },
      function(evt) {
        // Math.min is to fix IE which reports 200% sometimes
        $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
    // .
    //   xhr(function(xhr) {
    //     xhr.upload.addEventListener('abort', function() {console.log('abort complete');}, false);
    // });

  };


  $scope.onFormSubmit = function() {
    console.log('in onformsubmit');
    console.log($scope.files);
    var uploadData = {};
    if ($scope.files.length === 1) {
      Utils.setConfig(uploadData, $scope.formData.fileName, 'fileName');
    }
    Utils.setConfig(uploadData, $scope.formData.destination, 'destination');

    //$scope.files: an array of files selected, each file has name, size, and type.
    for (var i = 0; i < $scope.files.length; i++) {
      var file = $scope.files[i];
      $scope.upload = $upload.upload({
        url: '/upload', //upload.php script, node.js route, or servlet url
        // method: 'POST' or 'PUT',
        // headers: {'header-key': 'header-value'},
        // withCredentials: true,
        data: uploadData,
        file: file, // or list of files: $files for html5 only
        /* set the file formData name ('Content-Desposition'). Default is 'file' */
        //fileFormDataName: myFile, //or a list of names for multiple files (html5).
        /* customize how data is added to formData. See #40#issuecomment-28612000 for sample code */
        //formDataAppender: function(formData, key, val){}
      }).progress(function(evt) {
        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      }).success(function(data, status, headers, config) {
        // file is uploaded successfully
        console.log(data);
        console.log(status);

      }).error(function(data,status,headers,config) {
        console.log('error');
        console.log(data);
        console.log(status);
      });
      //.error(...)
      //.then(success, error, progress); 
      //.xhr(function(xhr){xhr.upload.addEventListener(...)})// access and attach any event listener to XMLHttpRequest.
    }
    $scope.uploadForm.$setPristine();
    $scope.formData = {};
    $scope.formData.destination = $scope.destinations[0];
    $scope.files = null;
    // $files = null;
    /* alternative way of uploading, send the file binary with the file's content-type.
       Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed. 
       It could also be used to monitor the progress of a normal http post/put request with large data*/
    // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
  };
}]);
