'use strict';

var argsList = require('args-list');
var logger = require('../utils/logger')(module);

module.exports = function () {
  var dependencies = {};
  var factories = {};
  var diContainer = {};

  diContainer.factory = function (name, factory) {
    //logger.debug('factory: name is ', name);
    factories[name] = factory;
  };

  diContainer.register = function (name, dep) {
    //logger.debug('register: name is ', name);
    dependencies[name] = dep;
  };

  diContainer.get = function (name) {
    //logger.debug('get: name = ', name);
    if (!dependencies[name]) {
      var factory = factories[name];
      //logger.debug('get. no dependencies. factory', factory);
      dependencies[name] = factory &&
          diContainer.inject(factory);
      if (!dependencies[name]) {
        throw new Error('Cannot find module: ' + name);
      }
    }
    return dependencies[name];
  };

  diContainer.inject = function (factory) {
    var args = argsList(factory)
      .map(function (dependency) {
        return diContainer.get(dependency);
      });
    return factory.apply(null, args);
  };

  return diContainer;
};
