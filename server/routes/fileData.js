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
/** @module routes/fileData */

'use strict';

var config = require('../config/config');
var logger = require('../utils/logger')(module);
var keyGen = require('../models/keyGen');
var keyExtract = require('../models/keyExtract');
var c = require('../config/redisScheme');

module.exports = function (FileData) {

  var fileDataRoute = {};

  /**
    * @description Returns list of all files for a user
    *
    * Invoked via GET https://dashboard_url/api/fileData/<user>/
    * @method: list
    * @example
    * Sample response:
    *
    *   { "data": [
    *       "file": {
              { "creator" : "user1",
                "global" : false,
                "createdTime": "1418060768120",
                "modifiedTime": "1418060768120",
                "path": "cifdata/apt4/data.json"
              }
            }
    *     ]
    *   }
    *
    * @example
    *
    *  Using curl:
    *
    *     curl -k https://dashboard_url/api/fileData/bobjones/
    *     curl -k https://dashboard_url/api/fileData/
    *
    * @return HTTP Status code and string reply.
    */
  fileDataRoute.list = function (req, res) {
    var id;
    logger.debug('routes/fileData GET');
    if (req.params.hasOwnProperty('id')) {
      id = req.params.id;
    } else {
      id = c.config.globalRoot;
    }
    FileData.list(id).then(function (reply) {
      res.status(200).send({data: reply});
    })
    .catch(function (err) {
      res.status(400).send(err.toString());
    });
  };

  fileDataRoute.show = function (req, res) {

  };

  fileDataRoute.create = function (req, res) {

  };

  fileDataRoute.update = function (req, res) {

  };

  fileDataRoute.delete = function (req, res) {

  };

  return fileDataRoute;

};
