'use strict';

/* Controllers */

angular.module('dimsDemo.controllers', [])
  // controller('AppCtrl', function ($scope, $http) {

  //   $http({
  //     method: 'GET',
  //     url: '/api/name'
  //   }).
  //   success(function (data, status, headers, config) {
  //     $scope.name = data.name;
  //   }).
  //   error(function (data, status, headers, config) {
  //     $scope.name = 'Error!';
  //   });

  // })
.controller ('UploadController', function($scope, $upload) {
  $scope.onFileSelect = function($files) {
    //$files: an array of files selected, each file has name, size, and type.
    for (var i = 0; i < $files.length; i++) {
      var file = $files[i];
      $scope.upload = $upload.upload({
        url: '/upload', //upload.php script, node.js route, or servlet url
        // method: 'POST' or 'PUT',
        // headers: {'header-key': 'header-value'},
        // withCredentials: true,
        data: {myObj: $scope.myModelObj},
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
      });
      //.error(...)
      //.then(success, error, progress); 
      //.xhr(function(xhr){xhr.upload.addEventListener(...)})// access and attach any event listener to XMLHttpRequest.
    }
    /* alternative way of uploading, send the file binary with the file's content-type.
       Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed. 
       It could also be used to monitor the progress of a normal http post/put request with large data*/
    // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
  };
}).
  controller('IpgrepController', function ($scope, $http, $location, $routeParams) {
    // write Ctrl here
    console.log($routeParams);
    

  }).
  controller('MainController', function ($scope, $location, $routeParams) {
    // write Ctrl here

  }).
  controller('AnonController', function ($scope, $http, $location, $routeParams) {
    console.log("In anon controller");
    AnonService.callClient();

}).
  controller('CifbulkController', function ($scope, $http, $location, $routeParams) {
    // write Ctrl here;
}).
  controller('CrosscorController', function ($scope, $http, $location, $routeParams) {
    // write Ctrl here;
}).
  controller('RwfindController', function ($scope, $http, $location, $routeParams) {
    console.log("In rwfind controller");
    $scope.callClient = function() {
      $http.get('/rwfind', {
        'debug':'true',
        'verbose':'true',
        'json': 'true'
      }).
        success(function(data, status, headers, config) {
          console.log("rwfind was called successfully");
          console.log(data);
          console.log(status);
          console.log(config);
        }).
        error(function(data, status, headers, config) {
          console.log("Error");
          console.log(data);
          console.log(status);
        });
    }
});