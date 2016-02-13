'use strict';

// Attributes route - retrieve and update all attributes via REST api
var util = require('util');
var validator = require('validator');
var _ = require('lodash-compat');

var logger = require('../utils/logger')(module);
var config = require('../config/config');
var resUtils = require('../utils/responseUtils');

module.exports = function (Attributes, attributeService, access) {
  var attributes = {};

  attributes.list = function (req, res) {
    Attributes.getAllAttributes()
    .then(function (reply) {
      res.status(200).send(resUtils.getSuccessReply(reply));
    })
    .catch(function (err) {
      res.status(400).send(resUtils.getErrorReply(err.toString()));
    })
    .done();
  };

  // return attributes for a user
  attributes.show = function (req, res) {
    req.checkParams('id', 'UserID contains invalid characters').matches(resUtils.validRegex());
    var errors = req.validationErrors(true);
    if (errors) {
      logger.error('show validation errors: ', errors);
      res.status(400).send(resUtils.getErrorReply(resUtils.getValidateError(errors)));
      return;
    }
    var user = req.params.id;
    var attributesFactory = Attributes.attributesFactory(user);
    attributesFactory.getAttributes(user)
    .then(function (reply) {
      res.status(200).send(resUtils.getSuccessReply(reply));
    })
    .catch(function (err) {
      res.status(400).send(resUtils.getErrorReply(err));
    })
    .done();
  };

  // config contained in body
  // type: type of attribute
  // action: add or remove
  // items: array of items to add or remove
  attributes.update = function (req, res) {

    var validActions = ['add', 'remove'],
        user,
        userAccess;

    // Get the access object
    userAccess = req.user;
    // Get the user from the access object
    user = access.username(userAccess);
    // Basic validations
    req.checkParams('id', 'UserID contains invalid characters').matches(resUtils.validRegex());
    req.checkBody('type', 'Request must contain valid type').isValidType(config.defaultAttributes);
    req.checkBody('action', 'Request must contain valid action').isValidType(validActions);
    req.checkBody('items', 'Request must contain items array').isArray();
    var errors = req.validationErrors(true);
    if (errors) {
      logger.error('update validation errors: ', errors);
      res.status(400).send(resUtils.getErrorReply(resUtils.getValidateError(errors)));
      return;
    }

    if (!access.isSysAdmin(userAccess) && req.body.type === 'tlp') {
      logger.error('user ', user, ' attempted to modify tlp without sysadmin access');
      res.status(400).send(resUtils.getErrorReply('User does not have authorization to modify tlp'));
      return;
    }

    // Perhaps should put this validation in model
    if (req.body.type === 'tlp' && req.body.items.length !== 1 || 
      req.body.type === 'tlp' && !config.tlpValues.hasOwnProperty(req.body.items[0])) {
      logger.error('user ', user, ' attempted to modify tlp without sysadmin access');
      res.status(400).send(resUtils.getErrorReply('Invalid TLP value supplied'));
      return;
    }

    if (req.body.type === 'tlp' && req.body.action === 'remove') {
      res.status(400).send(resUtils.getErrorReply('Cannot remove a TLP entry. Use add to replace'));
      return;
    }

    var promise = (req.body.action === 'add') ? 
        Attributes.save(req.params.id, req.body.type, req.body.items) : 
        Attributes.remove(req.params.id, req.body.type, req.body.items);
    promise
    .then(function (reply) {
      // Save the current attributes to file so ipgrep can access
      return attributeService.attributesToFile();
    })
    .then(function (reply) {
      logger.debug('update reply ', reply);
      res.status(200).send(resUtils.getSuccessReply(null));
    })
    .catch(function (err) {
      res.status(400).send(resUtils.getErrorReply(err));
    })
    .done();
  };

  return attributes;
};
