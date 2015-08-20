'use strict';

var config = require('../config/config');
var logger = require('../utils/logger')(module);
var  CryptoJS = require('crypto-js');
var exec = require('child_process').exec;

module.exports = function (UserModel) {
  var passportPostgres = {};

  passportPostgres.serialize = function (user, done) {
    // logger.debug('services/passport-static.serializeUser. user ident is ', user.get('ident'));
    done(null, user.get('ident'));
  };

  passportPostgres.deserialize = function deserialize(ident, done) {
    new UserModel.User({ident: ident}).fetch().then(function (user) {
      // logger.debug('services/passport.deserializeUser: retrieved user ident ', user.get('ident'));
      return done(null, user);
    }, function (error) {
      return done(error);
    }).catch(function (err) {
      logger.error('user fetch error ', err);
    });
  };

  passportPostgres.strategy = function strategy(username, password, done) {
    logger.debug('services/passport.use Starting function for ', username);
    // Look up the user corresponding to the supplied username
    new UserModel.User({ident: username}).fetch({require: true}).then(function (user) {
        logger.debug('services/passport.use Retrieved user ', user.get('ident'));
        // Decrypt password received via http post
        var decrypted = CryptoJS.AES.decrypt(password, config.passSecret).toString(CryptoJS.enc.Utf8);
        // Get the user's hashed password from the datastore
        var pw = user.get('password');
        // logger.debug('use: pw from datastore is ', pw);
        // logger.debug('use: pw from client is ', decrypted);
        // Call perl crypt to check password since we are using passwords generated using crypt
        var program = 'perl ' + __dirname + '/../utils/getPass.pl ' + decrypted + ' ' + '\'' + pw + '\'';
        var child = exec(program, function (error, stdout, stderr) {
          logger.debug('app/passport.use. getPass results. error, stdout, stderr', error, stdout, stderr);
          if (error !== null) {
            logger.error('app/passport.use: exec error. user, error ', username, error);
            return done(null, false, error);
          }
          if (pw === stdout) {
            logger.debug('app/passport.use: Passwords match. Return user');
            // We are passing back new user record
            return done(null, user);
          }
          logger.debug('app/passport.use: Passwords did not match. ', pw);
          return done(null, false, 'Invalid password');
        });

     // }, function (error) {
     // See https://github.com/petkaantonov/bluebird/wiki/Promise-anti-patterns#the-thensuccess-fail-anti-pattern

      }).catch(function (err) {
        var errmsg = '';
        logger.error('app/passport.use. Unknown user ', username, err);
        // check for connection refused errors
        if (err.hasOwnProperty('code')) {
          if (err.code === 'ECONNREFUSED') {
            errmsg = 'No connection to user database. Server returned ' + err;
          } else {
            errmsg = 'Unknown user ' + username + 'Server returned ' + err;
          }
        } else {
          errmsg = 'Unknown user ' + username;
        }
        return done(null, false, errmsg);
      });
  };

  return passportPostgres;
};
