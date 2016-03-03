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
var multiparty = require('multiparty');
var fs = require('fs');
var util = require('util');

module.exports = function (stixService, access) {

  var stix = {};

  // POST
  stix.post = function (req, res, next) {

    // Get the access object
    var userAccess = req.user;
    // Get the user from the access object
    var user = access.username(userAccess);
    logger.debug('body is ', req.body);
    var stixMeta = JSON.parse(req.body.data);
    logger.debug('files are', req.files);
    console.log(stixMeta);
    console.log(req.files);
    // body:
    // {
    //    action: md5, ip, fileinfo, hostname, or json
    //    file: path to file OR
    //    data: data included
    //    tlp: max tlp level
    // }

    if (_.isEmpty(req.files) && _.isEmpty(req.body.data)) {
      return res.status(400).send(resUtils.getErrorReply('No file or data supplied'));
    }
    var tlpLevel = stixMeta.tlp || 'green';
    logger.debug('action, path, level', stixMeta.action, req.files[0].path, tlpLevel);


    stixService.extract(stixMeta.action, req.files[0].path, tlpLevel)
    .then(function (reply) {
      logger.debug('stix route show reply', reply);
      var stixData = reply;
      fs.unlink(req.files[0].path, function (err) {
        if (err) {
          return res.status(400).send(resUtils.getErrorReply('Error deleting file - ' + err.toString()));
        }
        return res.status(200).send(resUtils.getSuccessReply(resUtils.formatResponse(stixMeta.action, stixData)));
      })

    })
    .catch(function (err) {
        return res.status(400).send(resUtils.getErrorReply(err.toString()));
      });


  };

  return stix;
};
