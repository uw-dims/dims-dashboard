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

exports.session = function(req,res) {
  // Return login session data - user plus settings
  var username = req.user.get('ident');
  var name = req.user.get('descr');
  var client = req.app.get('client');

  logger.debug('auth/session.session start username,name ', username, name );

  // Get associated settings
  // userSettings(client, username).getSettings(function(err, data) {
    var userSettings = new UserSettings(client, username);
    userSettings.getSettings(function(err, data) {
    logger.debug('session.session userSettings.getSettings data', data);
    if (err) return res.status(400).send(err);
    if (data) {
      res.status(200).send({data: sessionObject(username,name,data)});
    } else {
      userSettings(client, username).createSettings(function(err, data) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).send({data: sessionObject(username,name,data)});
        }
      });
    }
  });

  // settings(req.app.get('client'),req.user.get('ident')).getSettings(function(result) {
  //       if (result.status === 'error') {
  //         return res.status(400).send(result.message);
  //       } else if (result.data) {
  //         console.log(result.data);
  //         user_info.settings = result.data;
  //         res.status(200).send({user: user_info});
  //       } else {
  //         // No settings yet. Create them
  //         settings(req.app.get('client'),req.user.get('ident')).createSettings (function(result) {
  //           if (result.data) {
  //             user_info.settings = result.data;
  //           }
  //           res.status(200).send({user: user_info});
  //         });
  //       }
  //     });
  
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
      message = message + ((err !== null && err !== undefined) ? err : '');
      req.flash('username', req.body.username);
      req.flash('error', err);
      req.flash('info', info);
      return res.status(400).send(message);
    }
    // Puts the logged in user in the session and then return user and settings
    req.logIn(user, function(err) {

      if (err !== null && err !== undefined) {
        req.flash('error', err);
        return res.send(err);
      }

      var username = req.user.get('ident');
      var name = req.user.get('descr');
      var client = req.app.get('client');
      logger.debug('13 auth/session.login req.logIn callback. req.user ident is ', username, name);


      var userSettings = new UserSettings(client,username);
      userSettings.getSettings(function(err,data) {
        logger.debug('fixit result is ', err, data);
        if (err) {
          return res.status(400).send(err);
        } else if (data) {
          console.log(data);
          var object = sessionObject(username,name,data);
          console.log(object);
          res.status(200).send({data: object});
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

      logger.debug('14 auth/session.login req.logIn callback. call session function to return data');
     
    });
  })(req, res, next);
};

