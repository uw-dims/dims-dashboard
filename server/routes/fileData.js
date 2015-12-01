// File: server/routes/fileData.js

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
