angular.module('dimsDemo.controllers').
  controller('RwfindCtrl', function ($scope, Utils, $http, DateService, $location, $routeParams) {
    console.log("In rwfind controller");

    // Set up form data
    $scope.formData = {};
    $scope.outputTypes = [{
      value: 'json',
      label: 'JSON'
    },{
      value: 'text',
      label: 'TEXT'
    }];
    $scope.formData.outputType = $scope.outputTypes[0].value;

    // Set up file picker
    $scope.source = 'ip_lists';
    $scope.action = 'list';
    $scope.fileNames = [];
    $scope.showFiles = false;
    $scope.getFiles = function() {
      return $http ({
        method: 'GET',
        url: '/files',
        params: {
          source: $scope.source,
          action: $scope.action = 'list' 
        }
      }).success(function(data,status,headers,config){
        $scope.fileNames = data.result;
        $scope.filePath = data.path;
        $scope.showFiles = true;
      }).
        error(function(data,status,headers,config) {
          $scope.showFiles = false;
        })
    };
    $scope.getFiles();

    // Setup date
    $scope.dateConfig = DateService.dateConfig;

    $scope.open = function($event, datePicker) {
      var result = DateService.open($event, datePicker);
      $scope.dateConfig.startOpened = result[0];
      $scope.dateConfig.endOpened = result[1];
    };

    // Other setup
    $scope.showResults = false;
    $scope.showJsonResults = true;
    $scope.result = null;
    $scope.resultsMsg = 'Results';
    
    $scope.flows =[{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:00:48.965","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:01:48.959","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:02:48.942","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:03:48.990","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:04:48.953","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:05:48.986","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:06:48.997","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:07:48.993","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:08:48.996","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:09:48.959","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:10:48.953","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:11:48.982","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:12:48.982","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:13:48.973","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:14:48.990","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:15:48.947","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:16:48.916","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:17:48.990","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:18:48.977","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:19:48.941","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:20:48.980","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:21:48.957","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:22:48.984","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:23:48.993","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:24:48.887","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:25:48.968","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:26:48.991","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:27:48.931","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:28:48.983","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:29:48.983","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:30:48.993","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:31:48.981","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:32:48.936","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:33:48.981","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:34:48.991","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:35:48.973","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:36:48.976","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:37:48.968","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:38:48.950","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:39:48.976","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:40:48.973","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:41:48.957","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:42:48.978","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:43:48.979","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:44:48.986","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:45:48.985","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:46:48.917","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:47:48.947","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:48:48.990","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:49:48.987","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:50:48.958","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:51:48.971","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:52:48.962","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:53:48.963","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:54:48.988","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:55:48.996","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:56:48.940","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:57:48.972","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:58:48.986","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T04:59:48.931","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:00:48.985","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:01:48.971","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:02:48.958","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:03:48.989","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:04:48.975","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:05:48.981","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:06:48.973","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:07:48.996","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:08:48.991","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:09:48.909","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:10:48.994","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:11:48.951","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:12:48.975","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:13:48.984","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:14:48.950","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:15:48.977","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:16:48.971","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:17:48.969","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:18:48.978","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:19:48.988","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:20:48.964","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:21:48.940","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:22:48.957","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:23:48.996","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:24:48.977","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:25:48.980","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:26:48.971","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:27:48.970","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:28:48.954","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:29:48.975","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:30:48.983","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:31:48.997","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:32:48.954","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:33:48.980","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:34:48.985","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:35:48.904","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:36:48.989","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:37:48.985","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:38:48.945","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:39:48.986","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:40:48.956","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:41:48.973","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:42:48.947","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:43:48.985","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:44:48.983","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:45:48.994","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:46:48.968","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:47:48.957","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:48:48.988","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:49:48.975","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:50:48.990","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:51:48.966","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:52:48.994","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:53:48.973","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:54:48.961","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:55:48.967","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:56:48.976","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:57:48.979","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:58:48.972","dur":"0.000"},{"sIP":"140.142.29.115","dIP":"156.74.144.70","sPort":"8422","dPort":"60064","pro":"6","packets":"1","bytes":"84","flags":"PA","sTime":"2014/06/06T05:59:48.953","dur":"0.000"}] ;
    $scope.gridOptions = { data: "flows"};
    
    $scope.callClient = function() {

      console.log($scope.formData);
      $scope.showResults = false;
      $scope.showFormError = false;
      $scope.showJsonResults = false;
      $scope.formErrorMsg = "";

      if (!Utils.inputPresent($scope.formData.ips) && !Utils.inputPresent($scope.formData.fileName)) {
        $scope.showFormError = true;
        $scope.formErrorMsg = 'You have to either choose a file or enter the ips/CIDR/domains to search for.';
        return;
      }
      if (Utils.inputPresent($scope.formData.ips) && Utils.inputPresent($scope.formData.fileName)) {
        $scope.showFormError = true;
        $scope.formErrorMsg = 'You have to either choose a file or enter the ips/CIDR/domains to search for. You cannot do both';
        return;
      }

      if (!Utils.inputPresent($scope.formData.startDate) && !Utils.inputPresent($scope.formData.endDate) && 
          !Utils.inputPresent($scope.formData.numDays)) {
        $scope.showFormError = true;
        $scope.formErrorMsg = 'Either enter number of days, or enter a start time and (optionally) end time.';
        return;
      }
      if ((!Utils.inputPresent($scope.formData.startDate) && Utils.inputPresent($scope.formData.startHour))
        ||(!Utils.inputPresent($scope.formData.endDate) && Utils.inputPresent($scope.formData.endHour))) {
        $scope.showFormError = true;
        $scope.formErrorMsg = 'If you enter a value for the hour, also enter a value for the date.';
        return;
      }

      var clientConfig = {};
      var startTime = (Utils.inputPresent($scope.formData.startDate)) ? $scope.formData.startDate.getTime()/1000 : null;
      var endTime = (Utils.inputPresent($scope.formData.endDate)) ? $scope.formData.endDate.getTime()/1000 : null;      
      startTime = (Utils.inputPresent($scope.formData.startHour)) ? startTime + $scope.formData.startHour*60*60 : startTime;
      endTime = (Utils.inputPresent($scope.formData.endHour)) ? endTime + $scope.formData.endHour*60*60 : endTime;
      Utils.setConfig(clientConfig, startTime, 'startTime');
      Utils.setConfig(clientConfig, endTime, 'endTime');
      Utils.setConfig(clientConfig, $scope.formData.outputType, 'outputType');
      Utils.setConfig(clientConfig, $scope.formData.numDays, 'numDays');
      Utils.setConfig(clientConfig, $scope.formData.hitLimit, 'hitLimit');
      Utils.setConfig(clientConfig, $scope.formData.ips, 'ips');
      Utils.setConfig(clientConfig, $scope.formData.header, 'header');

      if (Utils.inputPresent($scope.formData.fileName)) {
        Utils.setconfig(clientConfig, $scope.filePath+$scope.formData.fileName, 'fileName');
      }
      console.log(clientConfig);
      console.log("Now sending http get request");
      $scope.resultsMsg = 'Results - Waiting...';
      $http(
        { method: 'GET',
          url: '/rwfind', 
          params: clientConfig
        } ).
        success(function(data, status, headers, config) {
          console.log("rwfind returned data");
          console.log(status);
           if ($scope.formData.outputType == 'json') {
              $scope.result = angular.fromJson(data);
              $scope.flows = $scope.result.flows;
              $scope.gridOptions = {
                data: "flows"
              }
              $scope.showJsonResults = true;
          } else {
              $scope.result = data;
          }
         
          $scope.showResults = true;
          $scope.resultsMsg = 'Results';         
          
        }).
        error(function(data, status, headers, config) {
          console.log("rwfind Error");
          console.log(data);
          console.log(status);
          $scope.showFormError = true;
          $scope.formErrorMsg = 'Your request did not get a result. Status: '+status;
          $scope.resultsMsg = 'Results';
          
              $scope.showResults = true;
        });
      }
});
