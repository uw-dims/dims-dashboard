'use strict';

var passport = require('passport');
var  CryptoJS = require('crypto-js');
var exec = require('child_process').exec;
var jwt = require('jsonwebtoken');
var logger = require('../utils/logger')(module);
var config = require('../config/config');

module.exports = function (userService, access) {

  var auth = {};

  // Callback for jwt strategy
  auth.onJwtAuth = function onJwtAuth(payload, next) {
    logger.debug('onJwtAuth payload', payload);
    // get access object for the user
    // will provide username, trustgroups and whether or not the
    // user is an admin in each trustgroup
    access.authorizations(payload.sub)
    .then(function (reply) {
      logger.debug('onJwtAuth reply from authorizations', reply);
      // this puts access object in request - so routes will know
      // the access of the requesting user
      return next(null, reply, {});
    })
    .catch(function (err) {
      logger.error('onJwtAuth', err);
      return next(err.toString(), false, {});
    });
  };

  // Callback for local strategy
  auth.onLocalAuth = function onLocalAuth(username, password, done) {

    logger.debug('Starting strategy for ', username);
    // Look up the user corresponding to the supplied username
    userService.getUserLogin(username)
    .then(function (reply) {
      var user = reply;
      return checkLogin(username, password, user, done);
    })
    .catch(function (err) {
      logger.error('strategy:', username, err);
      // check for connection refused errors
      if (err.hasOwnProperty('code')) {
        if (err.code === 'ECONNREFUSED') {
          return done('No connection to user database.', false, {});
        }
      }
      return done(err.toString(), false, {});
    });

  };

  auth.createToken = function createToken(username, scope) {
    logger.debug('createToken issuer is ', config.tokenIssuer);
    return jwt.sign(
      { scope: scope },
      config.tokenSecret,
      {
        expiresIn: config.tokenExpiresInMinutes,
        algorithm: config.tokenAlgorithm,
        issuer: config.tokenIssuer,
        subject: username
      });
  };

  // middleware for protecting routes
  auth.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
    return passport.authenticate('jwt', {session: false})(req, res, next);
  };

  // Serialize function when using sessions with passport
  auth.serialize = function (user, done) {
    done(null, user.username);
  };

  // Deserialize function when using sessions with passport
  auth.deserialize = function (username, done) {
    userService.getUserSession(username)
    .then(function (reply) {
      return done(null, reply);
    })
    .catch(function (err) {
      logger.error('Error deserializing user ', err);
      return done('Error deserializing user.');
    });
  };

  function checkLogin(username, password, user, cb) {
    var decrypted = CryptoJS.AES.decrypt(password, config.passSecret).toString(CryptoJS.enc.Utf8);
    // Get the user's hashed password from the datastore
    var pw = user.password;
    // Call perl crypt to check password since we are using passwords generated using crypt
    // Need to do more work on this to make sure input is sanitized - maybe use perl module instead
    // of child process exec
    var program = 'perl ' + __dirname + '/../utils/getPass.pl \'' + decrypted + '\' ' + '\'' + pw + '\'';
    exec(program, function (error, stdout, stderr) {
      if (error !== null) {
        logger.error('strategy: exec error. user is', username);
        return cb('Could not get MD5 hash of password - notify Admin', false, 'Could not get MD5 hash of password - notify Admin', false, {});
      }
      if (pw === stdout) {
        // Success - return user object
        return cb(null, user, {});
      }
      logger.debug('strategy: Passwords did not match for user. ');
      return cb(null, false, {message: 'Password does not match'});
    });
  }

  return auth;

};
