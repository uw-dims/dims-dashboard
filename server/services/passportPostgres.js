'use strict';

var config = require('../config/config');
var logger = require('../utils/logger')(module);
var  CryptoJS = require('crypto-js');
var exec = require('child_process').exec;

module.exports = function (userService) {
  var passportPostgres = {};

  passportPostgres.serialize = function (user, done) {
    done(null, user.username);
  };

  passportPostgres.deserialize = function deserialize(username, done) {
    userService.getUserSession(username)
    .then(function (reply) {
      return done(null, reply);
    })
    .catch(function (err) {
      logger.error('Error deserializing user ', err);
      return done('Error deserializing user.');
    });
  };

  passportPostgres.strategy = function strategy(username, password, done) {
    logger.debug('Starting strategy for ', username);
    // Look up the user corresponding to the supplied username
    userService.getUserLogin(username)
    .then(function (reply) {
      var user = reply;
      // Decrypt Base64 encoded encrypted password received via http post
      var decrypted = CryptoJS.AES.decrypt(password, config.passSecret).toString(CryptoJS.enc.Utf8);
      // Get the user's hashed password from the datastore
      var pw = user.password;
      // Call perl crypt to check password since we are using passwords generated using crypt
      // Need to do more work on this to make sure input is sanitized - maybe use perl module instead
      // of child process exec
      var program = 'perl ' + __dirname + '/../utils/getPass.pl \'' + decrypted + '\' ' + '\'' + pw + '\'';
      var child = exec(program, function (error, stdout, stderr) {
        // logger.debug('strategy: getPass results. stdout', stdout);
        if (error !== null) {
          logger.error('strategy: exec error. user is', username);
          return done('Could not get MD5 hash of password - notify Admin', false, 'Could not get MD5 hash of password - notify Admin');
        }
        if (pw === stdout) {
          // Success - return user object
          return done(null, user);
        }
        logger.debug('strategy: Passwords did not match for user. ');
        return done('Password does not match', false);
      });
    }).catch(function (err) {
      logger.error('strategy:', username, err);
      // check for connection refused errors
      if (err.hasOwnProperty('code')) {
        if (err.code === 'ECONNREFUSED') {
          return done('No connection to user database.');
        }
      }
      return done(err.toString(), false);
    });
  };

  return passportPostgres;
};
