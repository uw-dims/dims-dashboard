'use strict';

var passport = require('passport');
var moment = require('moment');
var logger = require('../utils/logger')(module);
// var UserSettings = require('../models/userSettings');

module.exports = function (UserSettings) {

  var session = {};

  var sessionObject = function (username, name, settings) {
    var object = {
      user: {
        username: username,
        name: name
      },
      settings: settings
    };
    return object;
  };

  // Return login session data - user plus settings
  session.session = function (req, res) {
    logger.debug(moment().toISOString(), 'routes/session.session Starting session.');
    if (req.user) {
      // we are not using ops-trust column names any more
      logger.debug(moment().toISOString(), 'routes/session.session returned req.user', req.user);
      console.log(req.user);
      var username = req.user.get('ident');
      var name = req.user.get('desc');
      // var username = req.user.get('id');
      // var name = req.user.get('name');
      // var client = req.app.get('client');
      logger.debug(moment().toISOString(), 'routes/session.session. req.user.get(ident) ', req.user.get('ident'));
      logger.debug(moment().toISOString(), 'routes/session.session. req.user.get(desc) ', req.user.get('desc'));
      logger.debug(moment().toISOString(), 'routes/session.session. req.user.data ', req.user.data);
      logger.debug(moment().toISOString(), 'routes/session.session. username, name ', username, name);

      // Get associated settings
      var userSettings = UserSettings.userSettingsFactory(username);
      userSettings.retrieveSettings().then(function (data) {
        logger.debug(moment().toISOString(), 'routes/session.js session reply from retrieve settings is ', data);
        var object = sessionObject(username, name, data);
        logger.debug(moment().toISOString(), 'routes/session.js sessionObject is ', object);
        res.status(200).send({data: object});
      }).then(function (err) {
        return res.status(400).send(err);
      });
    } else {
      return res.status(401).send('User not logged in');
    }
  };

  // Logout user
  session.logout = function (req, res) {
    if (req.user) {
      // logger.debug('routes/session.logout', req.user.get('id'));
      logger.debug('routes/session.logout', req.user.get('ident'));
      req.logout();
      // req.flash('info','You are now logged out.');
      res.status(200).send('Successfully logged out');
    } else {
      res.status(400).send('Not logged in');
    }
  };

  // Login user
  session.login = function (req, res, next) {
    logger.debug('in session.login');
    passport.authenticate('local', function (err, user, info) {
      // Info contains messages regarding why login was unsuccessful
      //console.trace();
      logger.debug('routes/session.login. Back from authenticate', err, user, info);
      if (err || !user) {
        logger.debug('routes/session.login. Unsuccessful Response from passport.authenticate. err, info: ', err, info);
        var message = (info !== null && info !== undefined) ? info : '';
        message = message + ((err !== null && err !== undefined) ? err : '');
        // req.flash('username', req.body.username);
        // req.flash('error', err);
        // req.flash('info', info);
        return res.status(400).send(message);
      }
      // logger.debug('routes/session.login. Successful response from passport.authenticate. err, user, info: ', err, user.get('id'), info);
      logger.debug('routes/session.login. Successful response from passport.authenticate. err, user, info: ', err, user.get('ident'), user.get('desc'), info);
      // Puts the logged in user in the session and then return user and settings
      req.logIn(user, function (err) {
        logger.debug('routes/session.login. Callback from req.logIn');
        if (err !== null && err !== undefined) {
          // req.flash('error', err);
          return res.status(400).send(err);
        }
        // var username = req.user.get('id');
        // var name = req.user.get('name');
        var username = req.user.get('ident');
        var name = req.user.get('desc');
        //var client = req.app.get('client');
        logger.debug('routes/session.login. req.user is ', req.user);
        logger.debug('routes/session.login. info from req.user is ', username, name);
        logger.debug('routes/session.login. Get user settings for user ', username);

        // Create new UserSettings object
        // If settings have never been saved, object will save
        // default settings
        UserSettings.getUserSettings(username).then(function (data) {
            logger.debug('routes/session.login. callback from userSettings.getUserSettings. username and name are now ', username, name);
            logger.debug('routes/session.login. callback from userSettings.getUserSettings. settings are ', data.settings);
            var object = sessionObject(username, name, data.settings);
            logger.debug('routes/session.login. object is ', object);
            res.status(200).send({data: object});
          }).then(function (err) {
            return res.status(400).send(err);
          });

      });
    })(req, res, next);
  };
  return session;
};



