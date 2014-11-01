'use strict';

var passport = require('passport');
var logger = require('../utils/logger');
var settings = require('../models/userSettings')

exports.session = function(req,res) {
  logger.debug('auth/session.session (get) user: ', req.user.get('ident'), req.user.get('desc'));
  // Note. At this point req.user contains complete user record
  // Return only the username
  var user_info = {
    username: req.user.get('ident'),
    name: req.user.get('descr')
  }

  settings(req.app.get('client'),req.user.get('ident')).getSettings(function(result) {
        if (result.status === 'error') {
          return res.status(400).send(result.message);
        } else if (result.data) {
          console.log(result.data);
          user_info.settings = result.data;
          res.status(200).send({user: user_info});
        } else {
          // No settings yet. Create them
          settings(req.app.get('client'),req.user.get('ident')).createSettings (function(result) {
            if (result.data) {
              user_info.settings = result.data;
            }
            res.status(200).send({user: user_info});
          });
        }
      });
  
};

exports.logout = function(req,res) {
  logger.debug('auth/session.logout');
  if (req.user) {
    req.logout();
    req.flash('info','You are now logged out.');
    res.status(200).send('Successfully logged out');
  } else {
    res.status(400).send('Not logged in');
  }
};

exports.login = function(req,res,next) {
  logger.debug('1 auth/session.login');
  passport.authenticate('local', function(err, user, info) {
    // At this point user is Bookshelf object
    // err, user, and info are passed back from passport.use 
    // Info contains messages regarding why login was unsuccessful
    
    if (err || !user) {
      console.log(err);
      console.log(info);
      var message = (info !== null && info !== undefined) ? info : '';
      message = message + ((err !== null && err !== undefined) ? err : '');
      logger.debug('auth/session.login authenticate callback error. Message: ', message);
      req.flash('username', req.body.username);
      req.flash('error', err);
      req.flash('info', info);
      return res.status(400).send(message);
    }
    // Puts the logged in user in the session and then return user info
    req.logIn(user, function(err) {

      if (err !== null && err !== undefined) {
        logger.debug('auth/session.login authenticate req.logIn err ', err);
        req.flash('error', err);
        return res.send(err);
      }
      // Send back req.user.ident. User is bookshelf object
      logger.debug('13 auth/session.login authenticate req.logIn success. req.user ident is ', req.user.get('ident'));
      // res.json(req.user)

      var user_info = {
        username: req.user.get('ident'),
        name: req.user.get('descr')
      };

      // Get user settings and put in user_info object

      settings(req.app.get('client'),req.user.get('ident')).getSettings(function(result) {
        if (result.status === 'error') {
          return res.status(400).send(result.message);
        } else if (result.data) {
          console.log(result.data);
          user_info.settings = result.data;
          res.send({user: user_info});
        } else {
          // No settings yet. Create them
          settings(req.app.get('client'),req.user.get('ident')).createSettings (function(result) {
            if (result.data) {
              user_info.settings = result.data;
            }
            res.send({user: user_info});
          });
        }
      });

      // Check for user prefs in session

      
    });
  })(req, res, next);
};

