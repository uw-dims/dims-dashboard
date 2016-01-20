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
      var user = req.user,
          authUserData;
      logger.debug('session: starting session for ', user.username);
      console.log('user is ', user);
      return userService.getUserSession(user.username)
      .then(function (reply) {
        authUserData = reply;
        return getSessionObject(authUserData);
      })
      .then(function (reply) {
        logger.debug('session:  sessionObject is ', reply);
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
  session.logout = function (req, res) {
    if (req.user) {
      logger.debug('logout:', req.user.username);
      req.logout();
      res.status(200).send(resUtils.getSuccessReply('Successfully logged out'));
    } else {
      res.status(401).send(resUtils.getErrorReply('User not logged in'));
    }
  };

  // Login user via login form and return object and token to user
  session.tokenLogin = function (req, res, next) {
    passport.authenticate('local', onLoginAuthenticate.bind(this, req, res))(req, res);
  };

  // Login user via google - callback
  session.googleLogin = function (req, res, error, user, info) {
    console.log('session.googleLogin error , user , info', error, user, info);
    onLoginAuthenticate(req, res, error, user, info);
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

  // Result of login authentication - local or google
  function onLoginAuthenticate(req, res, error, user, info) {
    console.log('onLoginAuthenticate error, user, info', error, user, info);
    if (error) {
      console.log('onLoginAuthenticate error', error);
      return res.status(500).send(resUtils.getErrorReply(error));
    }
    if (!user) {
      // info should contain message
      console.log('onLoginAuthenticate !user', info);
      return res.status(400).send(resUtils.getFailReply(info));
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

  // Given a username, return a session object and token
  function getSessionAndToken(username) {
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



