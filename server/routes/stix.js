'use strict';

var logger = require('../utils/logger')(module);
var config = require('../config/config');
var resUtils = require('../utils/responseUtils');
var validator = require('validator');
var _ = require('lodash-compat');

module.exports = function (stixService, access) {

  var stix = {};

  // POST
  stix.post = function (req, res) {

    // Get the access object
    var userAccess = req.user;
    // Get the user from the access object
    var user = access.username(userAccess);
    logger.debug('body is ', req.body);
    logger.debug('params are ', req.params);
    // body: 
    // {
    //    action: md5, ip, fileinfo, hostname, or json
    //    file: path to file OR
    //    data: data included
    //    tlp: max tlp level
    // }

    if (_.isEmpty(req.body.file) && _.isEmpty(req.body.data)) {
      return res.status(400).send(resUtils.getErrorReply('No file or data supplied'));
    }
    var tlpLevel = req.body.tlp || 'green';
    stixService.extract(req.body.action, req.body.file, tlpLevel)
    .then(function (reply) {
      logger.debug('stix route show reply', reply);
      return res.status(200).send(resUtils.getSuccessReply(resUtils.formatResponse(req.body.action, reply)));
    })
    .catch(function (err) {
        return res.status(400).send(resUtils.getErrorReply(err.toString()));
      });

  };

  return stix;
};
