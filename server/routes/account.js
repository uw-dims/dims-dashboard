'use strict';

var logger = require('../utils/logger')(module);
var config = require('../config/config');
var resUtils = require('../utils/responseUtils');

module.exports = function (authAccount) {
  var account = {};

  account.list = function (req, res) {
    return authAccount.getAccounts(req.user.username)
    .then(function(reply) {

    })
  }

  return account;
}
