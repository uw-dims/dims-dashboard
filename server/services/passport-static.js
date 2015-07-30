'use strict';

// Get the app configuration
var config = require('../config/config');
var logger = require('../utils/logger');
var  CryptoJS = require('crypto-js');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

// Get the user model so Passport can use it
// This is static model, so pass the config of static members
var userdata = require('../models/userStatic')(config.testUsers);

// Specify how to serialize user info
// Specify how to serialize user info
passport.serializeUser(function (user, done) {
  logger.debug('services/passport-static.serializeUser. user ident is ', user.get('ident'));
  done(null, user.get('ident'));
});

// Specify how to deserialize the user info
passport.deserializeUser(function (id, done) {
  // logger.debug('services/passport-static.deserializeUser: id is ', id);
  var user = userdata.findById(id);
  if (user === undefined) {
    return done('User was not found');
  } else {

    logger.debug('services/passport-static.deserializeUser: deserializeduser is ', user);
    logger.debug('services/passport-static.deserializeUser: deserializeduser ident and name are ', user.get('ident'), user.get('desc'));
    return done(null, user);
  }
});

// Use LocalStrategy and set function to check password
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, function (username, password, done) {
  logger.debug('services/passport-static.use: username, password are ', username, password);
  // Decrypt password received via http post
  var decrypted = CryptoJS.AES.decrypt(password, config.passSecret).toString(CryptoJS.enc.Utf8);
  logger.debug('decrypted is ', decrypted);
  // Look up the user corresponding to the supplied username
  var user = userdata.findById(username);
  logger.debug('services/passport-static.use: user is ', user);
  if (user === undefined) {
    logger.debug('services/passport-static.use: user is undefined');
    return done(null, false, 'Unknown user');
  } else {

    if (user.get('password') === decrypted) {
      logger.debug('services/passport-static.use: password is equal');

      logger.debug('services/passport-static.use: validated user is ', user.get('ident'));
      logger.debug('services/passport-static.use: validated user name is ', user.get('desc'));
      return done(null, user);

    } else {
      logger.debug('services/passport-static.use: invalid password');
      return done(null, false, 'Invalid password');
    }
  }
}));

module.exports = passport;

// EOF
