'use strict';

var _ = require('lodash-compat');
var logger = require('../utils/logger');

module.exports = function (userConfig) {

  var model = {};

  var user = {
    data: {},
    get: function (token) {
      return this.data[token];
    }
  };

  model.findById = function (id) {
    var result = _.find(userConfig, {'ident': id});
    // logger.debug('models/userStatic result is ', result);
    user.data = result;
    // logger.debug('models/userStatic user is now', user);
    // logger.debug('models/userStatic test');
    // logger.debug('models/userStatic name is user.get(desc) ', user.get('desc'));
    return user;
  };

  return model;
};

