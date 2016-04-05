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

var _ = require('lodash-compat');
var logger = require('../utils/logger')(module);

module.exports = function (userService) {

  var access = {};

  // Does the user have access to a trustgroup according to the supplied
  // authorizations for the user
  access.isAuthorized = function isAuthorized(authorizations, trustgroup) {
    if (!authorizations.tgs.hasOwnProperty(trustgroup)) {
      return false;
    }
    return true;
  };

  // Does the user, according to the supplied authorizations object, have
  // admin access to the trustgroup?
  access.isAdmin = function isAdmin(authorizations, trustgroup) {
    if (!authorizations.tgs.hasOwnProperty(trustgroup)) {
      return false;
    }
    return authorizations.tgs[trustgroup];
  };

  // Is the user a sysadmin according to the supplied authorizations?
  access.isSysAdmin = function isSysAdmin(authorizations) {
    return authorizations.isSysAdmin;
  };

  // Get the username from the authorizations object
  access.username = function username(authorizations) {
    return authorizations.username;
  };

  // Get the authorizations object for a user
  //
  // { isSysAdmin: true or false,
  //    username: username of user,
  //    tgs: {
  //       TG_ID: true if user has admin rights in tg, false if not,
  //       ... additional tgs ...
  //    }
  //
  // tgs is an object with a property for each tg that a user
  // has current access to. Value of each property is boolean - is the
  // user an admin in this tg.
  access.authorizations = function authorizations(username) {
    return getAuthorizations(username);
  };

  // Construct the authorizations object
  function getAuthorizations(username) {
    logger.debug('getAuthorizations username is ', username);
    var authorizations = {};
    return userService.getUserSession(username)
    .then(function (reply) {
      authorizations.isSysAdmin = reply.isSysadmin;
      authorizations.username = reply.username;
      authorizations.tgs = {};
      _.forEach(reply.loginTgs, function (value) {
        authorizations.tgs[value] = reply.trustgroups[value].admin;
      });
      logger.debug('getAuthorizations authorizations', authorizations);
      return authorizations;
    })
    .catch(function (err) {
      logger.error('getAuthorizations ', err);
      throw err;
    });
  }

  return access;

};
