/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

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
