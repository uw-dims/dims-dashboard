'use strict';

/* Directives */

angular.module('dimsNode.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  });
