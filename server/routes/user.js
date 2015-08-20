// file: server/routes/user.js

'use strict';

// Includes
var _ = require('lodash-compat');
var logger = require('../utils/logger')(module);

module.exports = function (UserModel) {

  var userRoute = {};

  var processUsers = function processUsers(users) {
    users.forEach(function (user, index, array) {
      array[index] = mapUserFields(user);
    });
    return users;
  };

  // Maps fields in member table
  var mapUserFields = function mapUserFields(user) {
    var result = {};
    result.username = user.ident;
    result.name = user.descr;
    result.affiliation = user.affiliation;
    result.tz = user.tz_info;
    result.im = user.im_info;
    result.tel = user.tel_info;
    result.sms = user.sms_info;
    result.post = user.post_info;
    result.bio = user.bio_info;
    result.airport = user.airport;
    result.isSysadmin = user.sysadmin;
    return result;
  };

  /**
    * @description Returns list of all users
    *
    * Invoked via GET https://dashboard_url/api/user/
    */
  userRoute.list = function (req, res) {
    logger.debug('in GET (list)');
    UserModel.Users.forge()
      .fetch()
      .then(function (collection) {
        //console.log(collection);
        //console.log(collection.toJSON());
        var reply = processUsers(collection.toJSON());
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
        //console.log(user.toJSON());
        UserModel.Email.forge({member: user.get('ident')})
          .fetch()
          .then(function (email) {
            //console.log(email.get('email'));
            var reply = mapUserFields(user.toJSON());
            reply.email = email.get('email');
            logger.debug('show reply:', reply);
            res.status(200).send({data: reply});
          });
      }).catch(function (err) {
        logger.error('show error:', err);
        res.status(400).send(err.toString());
      });
  };
  return userRoute;
};
