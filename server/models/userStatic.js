'use strict';

var _ = require('lodash-compat');
var moment = require('moment');
var logger = require('../utils/logger')(module);

module.exports = function (userConfig) {

  var model = {};

  var user = {
    data: {},
    get: function (token) {
      logger.debug('models/userStatic get: result is ', this.data[token]);
      return this.data[token];
    }
  };

  model.findById = function (id) {
    var result = _.find(userConfig, {'ident': id});
    // logger.debug('models/userStatic result is ', result);
    user.data = result;
    logger.debug('models/userStatic findById: user.data is now', user.data);
    console.log(user);
    logger.debug('models/userStatic findById: name is user.get(desc) ', user.get('desc'));
    return user;
  };

  return model;
};

