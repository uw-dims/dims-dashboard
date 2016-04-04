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

var passport = require('passport');
var _ = require('lodash-compat');
var validator = require('validator');

var logger = require('../utils/logger')(module);
var resUtils = require('../utils/responseUtils');
var config = require('../config/config');
var q = require('q');

module.exports = function (UserSettings, userService, auth, authAccount) {

  var session = {};

  // Login user via login form and return object and token to user
  session.tokenLogin = function (req, res, next) {
    passport.authenticate('local', onLoginAuthenticate.bind(this, req, res))(req, res, next);
  };

  session.googleLogin = function (req, res, next) {
    passport.authenticate('google', onSocialAuthenticate.bind(this, req, res))(req, res, next);
  };

  session.googleConnect = function (req, res, next) {
    var user = req.user;
    var account = req.account;
    return authAccount.createAccount(user.username, account.service, account)
    .then(function (reply) {
      res.redirect('/userinfo/accounts');
    });
  };

  // Return session for logged in user - user plus settings
  session.session = function (req, res) {
    if (req.user) {
      var user = req.user;
      logger.debug('session: retrieving session for ', user.username);
      return userService.getUserSession(user.username)
      .then(function (reply) {
        return getSessionObject(reply);
      })
      .then(function (reply) {
        res.status(200).send(resUtils.getSuccessReply(reply));
      })
      .catch(function (err) {
        res.status(400).send(resUtils.getErrorReply(err.toString()));
      });
    } else {
      res.status(401).send(resUtils.getErrorReply('User not logged in'));
    }
  };

  // Logout user
  // TODO: invalidate token
  session.logout = function (req, res) {
    if (req.user) {
      logger.debug('logout:', req.user.username);
      req.logOut();
      req.session.destroy(function (err) {
        res.status(200).send(resUtils.getSuccessReply('Successfully logged out'));
      });
    } else {
      logger.debug('User not logged in requested logout');
      res.status(401).send(resUtils.getErrorReply('User not logged in'));
    }
  };


  // Construct a session object from authUserData and user settings
  function getSessionObject(authUserData) {
    var settings = {};
    return UserSettings.getUserSettings(authUserData.username)
    .then(function (reply) {
      settings = reply;
      // Make sure trust group to login to is set
      if (!settings.getSettings().hasOwnProperty('currentTg')) {
        settings.settings.currentTg = authUserData.loginTgs[0];
      } else if (!_.includes(authUserData.loginTgs, { trustgroup: settings.getSettings().currentTg})) {
        settings.settings.currentTg = authUserData.loginTgs[0];
      }
      return settings.saveSettings();
    })
    .then(function () {
      return sessionObject(authUserData, settings.settings);
    })
    .catch(function (err) {
      throw err;
    });
  }

  function sessionObject(user, settings) {
    var object = {};
    object.user = user;
    object.settings = settings;
    return object;
  }

  // Result of local login authentication
  function onLoginAuthenticate(req, res, err, user, info) {
    if (err) {
      logger.error('onLoginAuthenticate error', err);
      return res.status(400).send(resUtils.getErrorReply(err));
    }
    if (!user) {
      // info should contain message
      return res.status(400).send(resUtils.getFailReply(info));
    }
    return getSessionAndToken(user.username)
    .then(function (reply) {
      req.login(reply.sessionObject.user, function (err) {
        if (err) {
          res.status(400).send(resUtils.getErrorReply(err.toString()));
        } else {
          res.status(200).send(resUtils.getSuccessReply(resUtils.formatResponse('login', reply)));
        }
      });
    })
    .catch(function (err) {
      logger.error('onLoginAuthenticate error', err);
      res.status(400).send(resUtils.getErrorReply(err.toString()));
    });
  }

  function loginErrorRedirect(err, res) {
    res.writeHead(302, {
      'Location': config.publicOrigin + '/login?error=' + err.toString()
    });
    return res.end();
  }

  function onSocialAuthenticate(req, res, err, user, info) {
    if (err) {
      logger.error('onSocialAuthenticate error', err);
      // return res.redirect('/login');
      return loginErrorRedirect('There was an error getting your social account. Login via username and password.', res);
    }
    if (!user) {
      logger.error('onSocialAuthenticate no user found', info);
      // return res.redirect('/login');
      return loginErrorRedirect(info + ' Login with your username and password first, then connect your account', res);
    }
    return getSessionAndToken(user.username)
    .then(function (reply) {
      req.login(reply.sessionObject.user, function (err) {
        if (err) {
          logger.error('onSocialAuthenticate error in req.login', err.toString());
          // return res.redirect('/login');
          return loginErrorRedirect('There was a login session error. Login via username and password.', res);
        } else {
          res.writeHead(302, {
            'Location': config.publicOrigin + '/socialauth?token=' + reply.token + '&username=' + user.username
          });
          return res.end();
        }
      });
    })
    .catch(function (err) {
      logger.error('onSocialAuthenticate error', err.toString());
      // return res.redirect('/login');
      return loginErrorRedirect('There was an error getting your user info. Login via username and password.', res);
    });
  }

  // Given a username, return a session object and token
  function getSessionAndToken(username) {
    logger.debug('getSessionAndToken username', username);
    var authUserData,
        tgs,
        token;
    // Get data to send to caller
    return userService.getUserSession(username)
    .then(function (reply) {
      authUserData = reply;
      tgs = reply.loginTgs;
      token = auth.createToken(username, tgs);
      return getSessionObject(authUserData);
    })
    .then(function (reply) {
      return {
        token: token,
        sessionObject: reply
      };
    })
    .catch(function (err) {
      throw err;
    });
  }

  session.getSessionAndToken = getSessionAndToken;

  return session;
};



