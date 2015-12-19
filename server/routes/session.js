'use strict';

var passport = require('passport');
var logger = require('../utils/logger')(module);
var _ = require('lodash-compat');

module.exports = function (UserSettings, userService) {

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
        res.status(200).send({data: sessionObject(user, data)});
      })
      .catch(function (err) {
        return res.status(400).send(err.toString());
      });
    } else {
      return res.status(401).send('User not logged in');
    }
  };

  // Logout user
  session.logout = function (req, res) {
    if (req.user) {
      logger.debug('logout:', req.user.username);
      req.logout();
      res.status(200).send('Successfully logged out');
    } else {
      res.status(400).send('Not logged in');
    }
  };

  // Get the settings and return in session object
  var getSessionObject = function getSessionObject(user) {
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
  };

  // Login user
  session.login = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
      // Check response from authenticate
      if (err || !user) {
        logger.error('login: Unsuccessful Response from passport.authenticate. err', err);
        var message = (info !== null && info !== undefined) ? info : '';
        message = message + ((err !== null && err !== undefined) ? err : '');
        return res.status(400).send(message);
      }
      // Get data for user session object
      userService.getUserSession(user.username)
      .then(function (reply) {
        var user = reply;
        // Puts the logged in user object in the session
        req.logIn(user, function (err) {
          if (err !== null && err !== undefined) {
            logger.error('login: Error returned from req.logIn: ', err);
            return res.status(400).send(err.toString());
          }
          getSessionObject(user)
          .then(function (reply) {
            res.status(200).send({data: reply});
          })
          .catch(function (err) {
            logger.error('session.login error in getUserSettings block', err);
            return res.status(400).send(err.toString());
          });
        });
      })
      .catch(function (err) {
        logger.error('session.login error in getUserSession catch ', err);
        return res.status(400).send(err.toString());
      });

    })(req, res, next);
  };
  return session;
};



