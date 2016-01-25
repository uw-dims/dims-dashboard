'use strict';

var passport = require('passport');
var _ = require('lodash-compat');
var validator = require('validator');

var logger = require('../utils/logger')(module);
var resUtils = require('../utils/responseUtils');
var config = require('../config/config');
var q = require('q');

var formatResponse = function formatResponse(key, data) {
  var result = {};
  result[key] = data;
  return result;
};

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
    var promises = [];
    console.log('connect user is ', user);
    console.log('connect account is ', account);
    // Save google id of user
    promises.push(authAccount.setUser(account.id, account.service, user.username));
    promises.push(authAccount.setUserId(user.username, account.service, account.id));
    return q.all(promises)
    .then(function (reply) {
      res.redirect('/userinfo/account');
    });
  };

  // Return session for logged in user - user plus settings
  session.session = function (req, res) {
    if (req.user) {
      var user = req.user;
      logger.debug('session: retrieving session for ', user.username);
      console.log('session: req.user is ', user);
      return userService.getUserSession(user.username)
      .then(function (reply) {
        console.log('session: getUserSession reply is ', reply);
        return getSessionObject(reply);
      })
      .then(function (reply) {
        console.log('session:  sessionObject is ', reply);
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
      req.logout();
      res.status(200).send(resUtils.getSuccessReply('Successfully logged out'));
    } else {
      res.status(401).send(resUtils.getErrorReply('User not logged in'));
    }
  };


  // Construct a session object from authUserData and user settings
  function getSessionObject(authUserData) {
    console.log('getSessionObject authUserData is ', authUserData);
    var settings = {};
    return UserSettings.getUserSettings(authUserData.username)
    .then(function (reply) {
      console.log('getSessionObject reply', reply);
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
          res.status(200).send(resUtils.getSuccessReply(formatResponse('login', reply)));
        }
      });
    })
    .catch(function (err) {
      logger.error('onLoginAuthenticate error', err);
      res.status(400).send(resUtils.getErrorReply(err.toString()));
    });
  }

  function onSocialAuthenticate(req, res, err, user, info) {
    if (err) {
      logger.error('onSocialAuthenticate error', err);
      return res.redirect('/login');
    }
    if (!user) {
      logger.error('onSocialAuthenticate no user found', info);
      return res.redirect('/login');
    }
    return getSessionAndToken(user.username)
    .then(function (reply) {
      req.login(reply.sessionObject.user, function (err) {
        if (err) {
          logger.error('onSocialAuthenticate error in req.login', err.toString());
          return res.redirect('/login');
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
      return res.redirect('/login');
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
      console.log('getSessionAndToken reply from getUserSession', reply);
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



