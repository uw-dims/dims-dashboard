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
  logger.debug('auth/session.login');
  passport.authenticate('local', function(err, user, info) {
    logger.debug('auth/session.login authenticate callback');
    logger.debug('auth/session.login authenticate callback. info: ', info);
    logger.debug('auth/session.login authenticate callback. err: ', err);
    if (err || !user) {
      req.flash('username', req.body.username);
      req.flash('error', err);
      return res.status(400).send(err);
    }
    req.logIn(user, function(err) {
      logger.debug('auth/session.login authenticate req.logIn. err ', err);
      logger.debug('auth/session.login authenticate req.logIn. user ', user);
      if (err) {
        req.flash('error', err);
        return res.send(err);
      }
      // Send back req.user.ident
      logger.debug('auth/session.login authenticate req.logIn. req.user.ident ', req.user.ident);
      res.json(req.user.ident)
    });
  })(req, res, next);
};