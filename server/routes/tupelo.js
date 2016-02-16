'use strict';

var logger = require('../utils/logger')(module);
var config = require('../config/config');
var resUtils = require('../utils/responseUtils');
var validator = require('validator');
var _ = require('lodash-compat');

module.exports = function (tupeloService, access) {

  var tupelo = {};

  tupelo.post = function (req, res) {
    // console.log(req);
    console.log(req.body);
    console.log(req.body.algorithm);
    console.log(req.body.hashes);
    // Get the access object
    var userAccess = req.user;
    // Get the user from the access object
    var user = access.username(userAccess);
    logger.debug('body is ', req.body);
    var message = JSON.stringify(req.body);
    logger.debug('message is ', message);
    // Not use amqp client now
    // var client = amqpClient.clientFactory();
    // client.prototype.on(client.getCorrelationId().toString(), function (reply) {
    //   logger.debug('reply is ', reply);
    //   client.getConnection.close();
    //   return res.status(200).send(resUtils.getSuccessReply(resUtils.formatResponse('tupelo', reply)));
    // });
    // client.request(message, 'tupelo');
    if (_.isEmpty(req.body) ) {
      return res.status(400).send(resUtils.getErrorReply('No data supplied'));
    }
    tupeloService.findHashes(req.body.hashes)
    .then(function (reply) {
      logger.debug('tupelo route show reply', reply);
      return res.status(200).send(resUtils.getSuccessReply(resUtils.formatResponse('tupelo', reply)));
    })
    .catch(function (err) {
      return res.status(400).send(resUtils.getErrorReply(err.toString()));
    });
  };

  return tupelo;
};
