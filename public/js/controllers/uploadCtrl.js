angular.module('dimsDemo.controllers').
  controller ('UploadCtrl', function($scope, $upload) {
console.log("In UploadController");
  // Setup form data
    $scope.formData = {};
    $scope.destinations = ['ip_lists', 'map_files', 'data_files'];
    $scope.formData.destination = $scope.destinations[0];

  $scope.onFileSelect = function($files) {
    $scope.files =  $files;
    console.log("set files");
    console.log($scope.files);
  };

  $scope.onFormSubmit = function() {
    console.log("in onformsubmit");
    console.log($scope.files);
    var uploadData = {};
    setConfig(uploadData, $scope.formData.fileName, 'fileName');
    setConfig(uploadData, $scope.formData.destination, 'destination');

    //$files: an array of files selected, each file has name, size, and type.
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

      });
      //.error(...)
      //.then(success, error, progress); 
      //.xhr(function(xhr){xhr.upload.addEventListener(...)})// access and attach any event listener to XMLHttpRequest.
    }
    $scope.uploadForm.$setPristine();
    $scope.formData = {};
    $scope.formData.destination = $scope.destinations[0];
    $scope.files = null;
    $files = null
    /* alternative way of uploading, send the file binary with the file's content-type.
       Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed. 
       It could also be used to monitor the progress of a normal http post/put request with large data*/
    // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
  };
});