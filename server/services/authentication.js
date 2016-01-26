'use strict';

var passport = require('passport');
var  CryptoJS = require('crypto-js');
var exec = require('child_process').exec;
var jwt = require('jsonwebtoken');
var logger = require('../utils/logger')(module);
var config = require('../config/config');

module.exports = function (userService, access, authAccount) {

  var auth = {};

  // Verify callback for jwt strategy
  auth.jwtStrategyVerify = function jwtStrategyVerify(payload, next) {
    logger.debug('auth.jwtStrategyVerify. payload is', payload);
    // get access object for the user
    // will provide username, trustgroups and whether or not the
    // user is an admin in each trustgroup
    access.authorizations(payload.sub)
    .then(function (reply) {
      logger.debug('auth.jwtStrategyVerify reply from authorizations', reply);
      // this puts access object in request - so routes will know
      // the access of the requesting user
      return next(null, reply, {});
    })
    .catch(function (err) {
      logger.error('onJwtAuth', err);
      return next(err.toString(), false, {});
    });
  };

  // Verify callback for local strategy
  auth.localStrategyVerify = function localStrategyVerify(username, password, done) {
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

  // Verify callback for GoogleStrategy
  auth.googleStrategyVerify = function googleStrategyVerify(req, accessToken, refreshToken, profile, done) {
    logger.debug('auth.googleStrategyVerify profile.id', profile.id);
    logger.debug('auth.googleStrategyVerify jwt ', req.headers.authorization);
    logger.debug('auth.googleStrategyVerify url ', req.url);
    return authAccount.getUser(profile.id, 'google')
    .then(function (reply) {
      if (reply === null) {
        return done(null, false, 'The Google account not connected to a DIMS user. ');
      } else {
        return done(null, {
          username: reply
        });
      }
    });
  };

  auth.googleConnectVerify = function googleConnectVerify(req, accessToken, refreshToken, profile, done) {
    logger.debug('google-authz verify callback ', accessToken, profile.id, profile.displayName, profile.email);
    console.log('google-authz verify callback req.user', req.user);
    console.log('google-authz verify callback profile', profile);
    logger.debug('google-authz verify callback authorizations ', req.headers.authorization);
    logger.debug('auth.googleStrategyVerify url ', req.url);
    // Return account object
    return done(null, {
      id: profile.id,
      displayName: profile.displayName,
      email: profile.emails[0].value,
      service: 'google'
    });
  };

  // Create a JWT
  auth.createToken = function createToken(username, scope) {
    logger.debug('Creating token for user and scope', username, scope);
    return jwt.sign(
      { scope: scope },
      config.tokenSecret,
      {
        expiresIn: config.tokenTTL,
        algorithm: config.tokenAlgorithm,
        issuer: config.tokenIssuer,
        subject: username
      });
  };

  // Middleware for protecting routes with JWT
  auth.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
    logger.debug('authenticating jwt route, url is ', req.url);
    // console.log(req);
    return passport.authenticate('jwt', {session: false})(req, res, next);
  };

  // Middleware for protecting routes via session
  auth.ensureAuthenticatedSession = function (req, res, next) {
    logger.debug('authenticating session route, url is ', req.url);
    if (!req.isAuthenticated()) {
      res.set('Content-Type', 'text/html');
      res.status(401).send('<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/"></head></html>');
    } else {
      return next();
    }
  };

  // Serialize function when using sessions with passport
  auth.serialize = function (user, done) {
    logger.debug('serialize user', user.username);
    done(null, user.username);
  };

  // Deserialize function when using sessions with passport
  auth.deserialize = function (username, done) {
    logger.debug('deserialize username', username);
    userService.getUserSession(username)
    .then(function (reply) {
      // console.log('deserialize user ', reply);
      return done(null, reply);
    })
    .catch(function (err) {
      logger.error('Error deserializing user ', err);
      return done('Error deserializing user.');
    });
  };

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
      return {
        token: token,
        sessionObject: authUserData
      };
    })
    .catch(function (err) {
      throw err;
    });
  }

  // Check supplied login credentials
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
