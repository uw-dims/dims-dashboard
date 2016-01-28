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
      console.log('account.js success reply');
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
      console.log('account.js success reply');
      res.status(200).send(resUtils.getSuccessReply(null));
    })
    .catch(function (err) {
      logger.error('account.list error: ', err.toString());
      res.status(400).send(resUtils.getErrorReply(err.toString()));
    });

  };

  return account;
};
