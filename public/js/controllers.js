'use strict';

/* Controllers */

var setConfig = function(config, data, property) {
    if ((data !== null) && (data !== undefined)) {
      config[property] = data;
    }
};

var EPOCH_DAY = 24*60*60*1000;

angular.module('dimsDemo.controllers', [])
  
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
    $scope.callClient = function() {
     return $http.get('/anon', {
        'debug':'true',
        'verbose':'true',
        'json': 'false',
        'file': 'data/rwfind_201210011617_8428.txt'
      }).
        success(function(data, status, headers, config) {
          console.log("Anon was called successfully");
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

}).

  controller('CifbulkController', function ($scope, $http, DateService, $location, $routeParams) {
    console.log("In cifbulk controller");

    // Setup form data
    $scope.formData = {};
    $scope.dateConfig = DateService.dateConfig;

    $scope.open = function($event, datePicker) {
      var result = DateService.open($event, datePicker);
      $scope.dateConfig.startOpened = result[0];
      $scope.dateConfig.endOpened = result[1];
    };

    $scope.callClient = function() {

      console.log($scope.formData);

      var clientConfig = {};
      var startTime = (($scope.formData.startDate !== null) && ($scope.formData.startDate !== undefined)) ? $scope.formData.startDate.getTime()/1000 : null;
      var endTime = (($scope.formData.endDate !== null) && ($scope.formData.endDate !== undefined)) ? $scope.formData.endDate.getTime()/1000 : null;
      setConfig(clientConfig, startTime, 'startTime');
      setConfig(clientConfig, endTime, 'endTime');
      setConfig(clientConfig, $scope.formData.numDays, 'numDays');
      setConfig(clientConfig, $scope.formData.ips, 'ips');
      setConfig(clientConfig, $scope.formData.stats, 'stats');
      setConfig(clientConfig, $scope.formData.header, 'header');

      console.log(clientConfig);

      $http.get('/cifbulk', clientConfig ).
        success(function(data, status, headers, config) {
          console.log("cifbulk was called successfully");
          console.log(data);
          console.log(status);
          console.log(config);
        }).
        error(function(data, status, headers, config) {
          console.log("cifbulk Error");
          console.log(data);
          console.log(status);
        });
      }    
}).

  controller('CrosscorController', function ($scope, $http, $location, $routeParams) {

    // Setup form data
    $scope.formData = {};

    $scope.callClient = function() {

      console.log($scope.formData);

      var clientConfig = {};
      setConfig(clientConfig, $scope.formData.mapfile, 'mapfile');
      setConfig(clientConfig, $scope.formData.iff, 'iff');
      setConfig(clientConfig, $scope.formData.stats, 'stats');
      setConfig(clientConfig, $scope.formData.file, 'file');

      console.log(clientConfig);

      $http.get('/crosscor', clientConfig ).
        success(function(data, status, headers, config) {
          console.log("crosscor was called successfully");
          console.log(data);
          console.log(status);
          console.log(config);
        }).
        error(function(data, status, headers, config) {
          console.log("crosscor Error");
          console.log(data);
          console.log(status);
        });
      }    

}).

  controller('RwfindController', function ($scope, $http, DateService, $location, $routeParams) {
    console.log("In rwfind controller");

    // Setup form data
    $scope.formData = {};
    $scope.outputTypes = ['json', 'text'];
    $scope.formData.outputType = $scope.outputTypes[0];

    $scope.dateConfig = DateService.dateConfig;

    $scope.open = function($event, datePicker) {
      var result = DateService.open($event, datePicker);
      $scope.dateConfig.startOpened = result[0];
      $scope.dateConfig.endOpened = result[1];
    };

    $scope.callClient = function() {

      console.log($scope.formData);

      var clientConfig = {};
      var startTime = (($scope.formData.startDate !== null) && ($scope.formData.startDate !== undefined)) ? $scope.formData.startDate.getTime()/1000 : null;
      var endTime = (($scope.formData.endDate !== null) && ($scope.formData.endDate !== undefined)) ? $scope.formData.endDate.getTime()/1000 : null;
      setConfig(clientConfig, startTime, 'startTime');
      setConfig(clientConfig, endTime, 'endTime');
      setConfig(clientConfig, $scope.formData.outputType, 'outputType');
      setConfig(clientConfig, $scope.formData.numDays, 'numDays');
      setConfig(clientConfig, $scope.formData.hitLimit, 'hitLimit');
      setConfig(clientConfig, $scope.formData.ips, 'ips');
      setConfig(clientConfig, $scope.formData.stats, 'stats');
      setConfig(clientConfig, $scope.formData.header, 'header');

      console.log(clientConfig);

      $http.get('/rwfind', clientConfig ).
        success(function(data, status, headers, config) {
          console.log("rwfind was called successfully");
          console.log(data);
          console.log(status);
          console.log(config);
        }).
        error(function(data, status, headers, config) {
          console.log("rwfind Error");
          console.log(data);
          console.log(status);
        });
      }
});
