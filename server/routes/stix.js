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
      // console.log(req);
    // console.log(req);
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
      return res.status(200).send(resUtils.getSuccessReply(resUtils.formatResponse(stixMeta.action, reply)));
    })
    .catch(function (err) {
        return res.status(400).send(resUtils.getErrorReply(err.toString()));
      });


  };

  return stix;
};
