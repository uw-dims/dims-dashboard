'use strict';

var passport = require('passport');
var logger = require('../utils/logger');
var UserSettings = require('../models/userSettings');

var sessionObject = function(username, name, settings) {
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
exports.session = function(req,res) {
  var username = req.user.get('ident');
  var name = req.user.get('descr');
  var client = req.app.get('client');
  logger.debug('routes/session.session. username, name ', username, name );

  // Get associated settings
  var userSettings = new UserSettings(client, username);
  userSettings.getSettings().then(function(data) {
      var object = sessionObject(username,name,data);
      res.status(200).send({data: object});
    }).then(function(err) {
      return res.status(400).send(err);
    });
};

// Logout user
exports.logout = function(req,res) {
  logger.debug('routes/session.logout', req.user.get('ident'));
  if (req.user) {
    req.logout();
    req.flash('info','You are now logged out.');
    res.status(200).send('Successfully logged out');
  } else {
    res.status(400).send('Not logged in');
  }
};

// Login user
exports.login = function(req,res,next) {
  passport.authenticate('local', function(err, user, info) {
    // Info contains messages regarding why login was unsuccessful  
    if (err || !user) {
      logger.debug('routes/session.login. Unsuccessful Response from passport.authenticate. err, info: ', err, info); 
      var message = (info !== null && info !== undefined) ? info : '';
      message = message + ((err !== null && err !== undefined) ? err : '');
      req.flash('username', req.body.username);
      req.flash('error', err);
      req.flash('info', info);
      return res.status(400).send(message);
    }
    logger.debug('routes/session.login. Successful response from passport.authenticate. err, user, info: ', err, user.get('ident'), info); 
    // Puts the logged in user in the session and then return user and settings
    req.logIn(user, function(err) {

      if (err !== null && err !== undefined) {
        req.flash('error', err);
        return res.status(400).send(err);
      }
      var username = req.user.get('ident');
      var name = req.user.get('descr');
      var client = req.app.get('client');
      logger.debug('routes/session.login. Get user settings for user ', username);

      var userSettings = new UserSettings(client,username);      
      userSettings.getSettings().then(function(data) {
          var object = sessionObject(username,name,data);
          res.status(200).send({data: object});
        }).then(function(err) {
          return res.status(400).send(err);
        });
     
    });
  })(req, res, next);
};

