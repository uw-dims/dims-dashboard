'use strict';

angular.module('dimsDashboard.controllers').
  controller('ChatCtrl', function($scope, $location, $log, ChatService, $rootScope) {

    $log.debug('chatCtrl. scope.currentUser is ', $scope.currentUser);

    $scope.chatMaximized = true;
    $scope.chatClass = 'chatMax';

    $scope.close = function() {
      $rootScope.chatOn = false;
      ChatService.stop();
    };

    $scope.hide = function() {
      $rootScope.chatMaximized = false;
      $scope.chatClass = 'chatMin'
    };

    $scope.show = function() {
      $rootScope.chatMaximized = true;
      $scope.chatClass = 'chatMax'
    };

    $scope.messages = '';

    var formatter = function(date, message) {
      return data.toLocaleTimeString() + '-' + message + '\n';
    };

    $scope.$on('socket:chat:data', function(event, data) {
      $log.debug('ChatCtrl: got a message ', event.name, data);
      if (!data.payload) {
        $log.error('ChatCtrl: Invalid message', 'event', event, 'data', JSON.stringify(data));
        return;
      }
      $scope.$apply(function() {
        $scope.messages = formatter(new Date(), data.payload) + $scope.messages;
      });
    });

  });