/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

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

    // Only sysadmin can modify tlp
    if (!access.isSysAdmin(userAccess) && req.body.type === 'tlp') {
      logger.error('user ', user, ' attempted to modify tlp without sysadmin access');
      res.status(400).send(resUtils.getErrorReply('User does not have authorization to modify tlp'));
      return;
    }

    // TLP value is restricted
    if (req.body.type === 'tlp' && req.body.items.length !== 1 ||
      req.body.type === 'tlp' && !config.tlpValues.hasOwnProperty(req.body.items[0])) {
      logger.error('user ', user, ' attempted to update TLP with invalid value');
      res.status(400).send(resUtils.getErrorReply('Invalid TLP value supplied'));
      return;
    }

    // TLP cannot be removed - add will replace current value if it exists
    if (req.body.type === 'tlp' && req.body.action === 'remove') {
      logger.error('user ', user, ' attempted to remove TLP value');
      res.status(400).send(resUtils.getErrorReply('Cannot remove a TLP entry. Use add to replace'));
      return;
    }

    // User can only modify own attributes. Must have sysadmin access to modify other
    // users' attributes
    if (req.params.id !== user && !access.isSysAdmin(userAccess)) {
      logger.error('user ', user, ' attempted to modify attribute for ', req.params.id, ' without authorization');
      res.status(400).send(resUtils.getErrorReply('Can only modify your own attributes'));
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
