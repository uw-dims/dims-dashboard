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

'use strict';

var logger = require('../utils/logger')(module);
var config = require('../config/config');
var resUtils = require('../utils/responseUtils');

module.exports = function (authAccount, access) {
  var account = {};

  // Return a list of accounts for a user
  // {
  //    status: 'success',
  //    data: {
  //      accounts: [ array of accounts ]
  //    }
  //  }
  //
  //  An account:
  //  {
  //    id: ID for the account from the authentication service
  //    displayName: User's name
  //    email: Email address for the social account
  //    service: authentication service (a.k.a google)
  //  }
  account.list = function (req, res) {

    // user is the authorizations object contained in the request. It must be present
    if (!req.user) {
      return res.status(500).send(resUtils.getErrorReply('Authentication error: User is not defined in request'));
    }
    // req.user in routes protected by token access is a userAccess object:
    // {
    //   isSysAdmin: true or false,
    //   username: 'username',
    //   tgs: {
    //     tgname1: admin true or false,
    //     tgname2: admin true or false,
    //     ...
    //   }
    // }
    var user = access.username(req.user);

    return authAccount.getAccounts(user)
    .then(function (reply) {
      res.status(200).send(resUtils.getSuccessReply(resUtils.formatResponse('accounts', reply)));
    })
    .catch(function (err) {
      logger.error('account.list error: ', err.toString());
      res.status(400).send(resUtils.getErrorReply(err.toString()));
    });
  };

  account.delete = function (req, res) {
    // user is the authorizations object contained in the request. It must be present
    if (!req.user) {
      return res.status(500).send(resUtils.getErrorReply('Authentication error: User is not defined in request'));
    }
    if (!req.params.service) {
      return res.status(400).send(resUtils.getFailReply({service: 'account service must be present.'}));
    }
    return authAccount.deleteAccount(access.username(req.user), req.params.service)
    .then(function (reply) {
      res.status(200).send(resUtils.getSuccessReply(null));
    })
    .catch(function (err) {
      logger.error('account.list error: ', err.toString());
      res.status(400).send(resUtils.getErrorReply(err.toString()));
    });

  };

  return account;
};
