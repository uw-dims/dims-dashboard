'use strict';

// Currently not used

var logger = require('../utils/logger');

// Get the session data for the logged in user
// If data doesn't exist, create it
exports.session = function(req,res) {
  logger.debug('usersession.session (get) ');
  var user = req.session.passport.user;
  if (!req.session[user]) {
    logger.debug('create the new session');
    req.session[user] = {};
  }

  if (!req.session[user_info.username]) {
          logger.debug('put user settings in the session');
          var key = 'userSetting:'+user_info.username;
          client.hgetall(key, function(err, data) {
              if (err) {
                return res.status(400).send('Error retrieving from database');
              } else if (data !== null) {
                logger.debug('get result is ', data);
                return res.status(200).send(data);
              } else {
                return res.status(204).send('No settings exist for this user');
              }
          } );
        }
  res.status(200).send(req.session[user]);
};