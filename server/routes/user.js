// file: server/routes/user.js

'use strict';

// Includes
var _ = require('lodash-compat');
var logger = require('../utils/logger')(module);

module.exports = function (UserModel) {

  var userRoute = {};

  var processUsers = function processUsers(collection) {
    var users = collection.toJSON();
    var result = [];
    users.forEach(function (user, index, array) {
      result.push(reduceUser(user));
    });
    return result;
  };

  // Returns just what is needed for list of users
  var reduceUser = function reduceUser(user) {
    var result = {
      username: user.ident,
      name: user.descr,
      tz: user.tz_info,
      phone: user.tel_info,
      sms: user.sms_info,
      im: user.im_info
    };
    // Just send back first email for now:
    result.email = user.email[0].email;
    // result.email = [];
    // user.email.forEach(function (email, index, array) {
    //   result.email.push(email.email);
    // });
    return result;
  };

  // We're parsing here since Bookshelf is having issues getting related
  // records when parsing in the model.
  var parseUser = function parseUser(user) {
    return {
      username: user.ident,
      name: user.descr,
      affiliation: user.affiliation,
      tz: user.tz_info,
      im: user.im_info,
      phone: user.tel_info,
      sms: user.sms_info,
      post: user.post_info,
      bio: user.bio_info,
      airport: user.airport,
      entered: user.entered,
      activity: user.activity,
      isSysadmin: user.sysadmin,
      image: user.image,
      loginAttempts: user.login_attempts,
      loginTryBegin: user.login_try_begin
    };
  };

  var parseEmail = function parseEmail (attrs) {
    return {
        member: attrs.member,
        email: attrs.email,
        pgpkeyId: attrs.pgpkey_id,
        pgpkeyExpires: attrs.pgpkey_expire
      };
  };

  /**
    * @description Returns list of all users
    *
    * Invoked via GET https://dashboard_url/api/user/
    */
  userRoute.list = function (req, res) {
    logger.debug('in GET (list)');
    UserModel.Users.forge()
      .fetch({ withRelated: ['email']})
      .then(function (collection) {
        //console.log(collection);
        // console.log(collection.toJSON());
        var reply = processUsers(collection);
        res.status(200).send({data: reply});
      }).catch(function (err) {
        logger.error('list error:', err);
        res.status(400).send(err.toString());
      });
  };

  /**
    * @description Returns a user
    *
    * Invoked via GET https://dashboard_url/api/user/id
    */
  userRoute.show = function (req, res) {
    logger.debug('in GET (show). id is ', req.params.id);
    UserModel.User.forge({ident: req.params.id})
      .fetch({require: true, withRelated: ['email']})
      .then(function (user) {
        user = user.toJSON();
        // For now, just use first email in array.
        var userResult = _.assign(parseUser(user), parseEmail(user.email[0]));
        // userResult.email = [];
        // user.email.forEach(function (email, index, array) {
        //   userResult.email.push(parseEmail(email));
        // });
        res.status(200).send({data: userResult});
      }).catch(function (err) {
        logger.error('show error:', err);
        res.status(400).send(err.toString());
      });
  };
  return userRoute;
};
