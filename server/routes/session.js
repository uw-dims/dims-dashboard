'use strict';

var passport = require('passport');
var logger = require('../utils/logger');

exports.session = function(req,res) {
  logger.debug('auth/session.session (get) user: ', req.user);
  // Note. At this point req.user contains complete user record
  // Return only the username
  res.json(req.user.ident);
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
      var message = (info !== null && info !== undefined) ? info : '';
      message = message + (err !== null && err !== undefined) ? err : '';
      logger.debug('auth/session.login authenticate callback error. Message: ', message);
      req.flash('username', req.body.username);
      req.flash('error', err);
      req.flash('info', info);
      return res.status(400).send(message);
    }
    // Puts the logged in user in the session
    req.logIn(user, function(err) {

      if (err !== null && err !== undefined) {
        logger.debug('auth/session.login authenticate req.logIn err ', err);
        req.flash('error', err);
        return res.send(err);
      }
      // Send back req.user.ident. User is bookshelf object
      logger.debug('13 auth/session.login authenticate req.logIn success. req.user ident is ', req.user.get('ident'));
      // res.json(req.user)
      res.send({user: req.user.get('ident')});
    });
  })(req, res, next);
};