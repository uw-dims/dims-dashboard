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

var logger = require('../utils/logger')(module);
var config = require('../config/config');
var resUtils = require('../utils/responseUtils');
var validator = require('validator');
var _ = require('lodash-compat');

module.exports = function (tupeloService, access) {

  var tupelo = {};

  tupelo.post = function (req, res) {
    // Get the access object
    var userAccess = req.user;
    // Get the user from the access object
    var user = access.username(userAccess);
    logger.debug('body is ', req.body);
    var message = JSON.stringify(req.body);
    logger.debug('message is ', message);

    if (_.isEmpty(req.body) ) {
      return res.status(400).send(resUtils.getErrorReply('No data supplied'));
    }
    tupeloService.findHashes(req.body.hashes)
    .then(function (reply) {
      logger.debug('tupelo route show reply', reply);
      // reply = JSON.parse(reply);
      return res.status(200).send(resUtils.getSuccessReply(resUtils.formatResponse('tupelo', reply)));
    })
    .catch(function (err) {
      return res.status(400).send(resUtils.getErrorReply(err.toString()));
    });
  };

  return tupelo;
};
