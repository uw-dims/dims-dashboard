(function () {

  'use strict';

  function SocialAuthCtrl($scope, $log, $rootScope, $routeParams, $location) {
    var vm = this;
    console.log('in SocialAuthCtrl');
    console.log($routeParams);
    console.log($scope);
    // $scope.$on('$routeChangeSuccess', function () {
    //   console.log('route change');
    //   console.log($routeParams);
    //   console.log($scope);
    // });
  }

  // Plug controller function into AngularJS
  angular
    .module('dimsDashboard.controllers')
    .controller('SocialAuthCtrl', SocialAuthCtrl);

  SocialAuthCtrl.$inject = ['$scope', '$log', '$rootScope', '$routeParams', '$location'];


}());
