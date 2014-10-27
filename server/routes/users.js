'use strict'

var logger = require('../utils/logger');
var config = require('../config');
var User = require('../models/user.js');

exports.show = function(req, res, next){
  var userId = req.params.id;

  User.findById(userId, function(err, user) {

    if (err) {
      return next(new Error('Failed to load User'));
    }

    if (user) {
      res.status(200).send({username: user.username, profile: user.profile});
    } else {
      res.status(404).send('USER_NOT_FOUND');
    }

  });

};

exports.exists = function(req, res, next) {
  var username = req.params.username;
  logger.debug('user.exists: username - ', username);

  // Next would search datastore for user
  // TBD
  User.findUser(username, function (err, user) {
    if (err) {
      return next(new Error('Failed to load User ' + username));
    }
    if (user) {
      res.status(200).json({exists: true });
    } else {
      res.status(200).json({exists: true });
    }
  })
};

