// file: server/routes/user.js

'use strict';

// Includes
var _ = require('lodash-compat');
var logger = require('../utils/logger')(module);
var resUtils = require('../utils/responseUtils');
var util = require('util');

module.exports = function (UserModel, userService) {

  var userRoute = {};

  /**
    * @description Returns list of all users
    *
    * Invoked via GET https://dashboard_url/api/user/
    */
  userRoute.list = function (req, res) {
    req.checkQuery('tg', 'Trust group ID missing or invalid').matches(resUtils.validRegex());
    var errors = req.validationErrors(true);
    if (errors) {
      logger.error('list validation errors: ', errors);
      res.status(400).send(resUtils.getErrorReply(resUtils.getValidateError(errors)));
      return;
    }
    userService.getUsersInfo(req.query.tg)
    .then(function (reply) {
      res.status(200).send(resUtils.getSuccessReply(reply));
    })
    .catch(function (err) {
      res.status(400).send(resUtils.getErrorReply(err.toString()));
    })
    .done();
  };

  /**
    * @description Returns a user
    *
    * Invoked via GET https://dashboard_url/api/user/id
    */
  userRoute.show = function (req, res) {
    req.checkQuery('tg', 'Trust group ID missing or invalid').matches(resUtils.validRegex());
    req.checkParams('id', 'UserID contains invalid characters').matches(resUtils.validRegex());
    var errors = req.validationErrors(true);
    if (errors) {
      logger.error('show validation errors: ', errors);
      res.status(400).send(resUtils.getErrorReply(resUtils.getValidateError(errors)));
      return;
    }

    userService.getUsersInfo(req.query.tg, req.params.id)
    .then(function (reply) {
      if (reply === undefined) {
        res.status(404).send(resUtils.getErrorReply('The user you requested does not exist in the specified trust group.'));
      } else {
        res.status(200).send(resUtils.getSuccessReply(reply));
      }
    })
    .catch(function (err) {
      res.status(400).send(resUtils.getErrorReply(err.toString()));
    })
    .done();
  };

  // Returns just what is needed for list of users - not used
  var reduceUser = function reduceUser(user) {
    var result = {
      username: user.username,
      name: user.name,
      tz: user.tz_info,
      phone: user.tel_info,
      sms: user.sms_info,
      im: user.im_info
    };
    return result;
  };

  return userRoute;
};
