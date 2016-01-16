'use strict';

var _ = require('lodash-compat');
var logger = require('../utils/logger')(module);
var config = require('../config/config');

module.exports = function (userService, UserSettings) {

  var access = {};

  // Does the user have access to a trustgroup according to the supplied
  // authorizations for the user
  access.isAuthorized = function isAuthorized(authorizations, trustgroup) {
    if (!authorizations.tgs.hasOwnProperty(trustgroup)) {
      return false;
    }
    return true;
  };

  // Is the user, according to the supplied authorizations object, have
  // admin access to the trustgroup
  access.isAdmin = function isAdmin(authorizations, trustgroup) {
    if (!authorizations.tgs.hasOwnProperty(trustgroup)) {
      return false;
    }
    return authorizations.tgs[trustgroup];
  };

  // Is the user a sysadmin according to the supplied authorizations?
  access.isSysAdmin = function isSysAdmin(authorizations) {
    return authorizations.isSysAdmin;
  };

  // Get the username from the authorizations object
  access.username = function username(authorizations) {
    return authorizations.username;
  };

  // Get the authorizations object for a user
  access.authorizations = function authorizations(username) {
    return getAuthorizations(username);
  };

  // Construct the authorizations object
  function getAuthorizations(username) {
    logger.debug('getAuthorizations username is ', username);
    var authorizations = {};
    return userService.getUserSession(username)
    .then(function (reply) {
      authorizations.isSysAdmin = reply.isSysadmin;
      authorizations.username = reply.username;
      authorizations.tgs = {};
      _.forEach(reply.loginTgs, function (value) {
        authorizations.tgs[value] = reply.trustgroups[value].admin;
      });
      logger.debug('getAuthorizations authorizations', authorizations);
      return authorizations;
    })
    .catch(function (err) {
      logger.error('getAuthorizations ', err);
      throw err;
    });
  }

  return access;

};
