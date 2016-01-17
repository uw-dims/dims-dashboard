'use strict';

var passport = require('passport');
var _ = require('lodash-compat');
var util = require('util');
var validator = require('validator');

var logger = require('../utils/logger')(module);
var resUtils = require('../utils/responseUtils');
var config = require('../config/config');

var formatResponse = function formatResponse(key, data) {
  var result = {};
  result[key] = data;
  return result;
};

module.exports = function (UserSettings, userService, auth) {

  var session = {};

  var sessionObject = function (user, settings) {
    var object = {};
    object.user = user;
    object.settings = settings;
    return object;
  };

  // Return login session data - user plus settings
  session.session = function (req, res) {
    if (req.user) {
      var user = req.user;
      logger.debug('session: starting session for ', user.username);
      // Get associated settings
      var userSettings = UserSettings.userSettingsFactory(user.username);
      userSettings.retrieveSettings()
      .then(function (data) {
        logger.debug('session:  sessionObject is ', sessionObject(user, data));
        res.status(200).send(resUtils.getSuccessReply(sessionObject(user, data)));
      })
      .catch(function (err) {
        res.status(400).send(resUtils.getErrorReply(err.toString()));
      });
    } else {
      res.status(401).send(resUtils.getErrorReply('User not logged in'));
    }
  };

  // Logout user
  session.logout = function (req, res) {
    if (req.user) {
      logger.debug('logout:', req.user.username);
      req.logout();
      res.status(200).send(resUtils.getSuccessReply('Successfully logged out'));
    } else {
      res.status(401).send(resUtils.getErrorReply('User not logged in'));
    }
  };

  // Get the settings and return in session object
  function getSessionObject(user) {
    var settings = {};
    return UserSettings.getUserSettings(user.username)
    .then(function (reply) {
      settings = reply;
      // Make sure trust group to login to is set
      if (!settings.getSettings().hasOwnProperty('currentTg')) {
        settings.settings.currentTg = user.loginTgs[0];
      } else if (!_.includes(user.loginTgs, { trustgroup: settings.getSettings().currentTg})) {
        settings.settings.currentTg = user.loginTgs[0];
      }
      return settings.saveSettings();
    })
    .then(function () {
      return sessionObject(user, settings.settings);
    })
    .catch(function (err) {
      throw err;
    });
  }

  function onLoginAuthenticate(req, res, error, user, info) {
    if (error) {
      res.status(500).send(resUtils.getErrorReply(error));
    }
    if (!user) {
      // info should contain message
      res.status(400).send(resUtils.getFailReply(info));
    }
    return getSessionAndToken(user.username)
    .then(function (reply) {
      res.status(200).send(resUtils.getSuccessReply(formatResponse('login', reply)));
    })
    .catch(function (err) {
      logger.error('onLoginAuthenticate error', err);
      res.status(400).send(resUtils.getErrorReply(err.toString()));
    });
  }

  function getSessionAndToken(username) {
    var authUserData,
        tgs,
        token;
    // Get data to send to caller
    userService.getUserSession(username)
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

  // Login user and return object and token
  session.tokenLogin = function (req, res, next) {
    passport.authenticate('local', onLoginAuthenticate.bind(this, req, res))(req, res);
  };

  session.onGoogleSuccess = function (req, res, error, user, info) {
    if (error) {
      res.status(500).send(resUtils.getErrorReply(error));
    }
    if (!user) {
      // info should contain message
      res.status(400).send(resUtils.getFailReply(info));
    }
  };

  // Login user and save session (if not using token)
  session.login = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
      // Check response from authenticate
      if (err || !user) {
        logger.error('login: Unsuccessful Response from passport.authenticate. err', err);
        var message = (info !== null && info !== undefined) ? info : '';
        message = message + ((err !== null && err !== undefined) ? err : '');
        logger.error('login: Unsuccessful. Message is ', message);
        res.status(400).send(resUtils.getErrorReply(message));
        return;
      }
      // Get data for user session object
      userService.getUserSession(user.username)
      .then(function (reply) {
        var user = reply;
        // Puts the logged in user object in the session
        req.logIn(user, function (err) {
          if (err !== null && err !== undefined) {
            logger.error('login: Error returned from req.logIn: ', err);
            res.status(400).send(resUtils.getErrorReply(err.toString()));
          }
          getSessionObject(user)
          .then(function (reply) {
            res.status(200).send(resUtils.getSuccessReply(reply));
          })
          .catch(function (err) {
            logger.error('session.login error in getUserSettings block', err);
            res.status(400).send(resUtils.getErrorReply(err.toString()));
          });
        });
      })
      .catch(function (err) {
        logger.error('session.login error in getUserSession catch ', err);
        res.status(400).send(resUtils.getErrorReply(err.toString()));
      });

    })(req, res, next);
  };
  return session;
};



