// File: server/routes/notification.js

/** @module routes/notification */

'use strict';

var config = require('../config/config');
var logger = require('../utils/logger');
var keyGen = require('../models/keyGen');
var keyExtract = require('../models/keyExtract');

module.exports = function (Notification) {

  var notificationRoute = {};

  notificationRoute.list = function (req, res) {
    logger.debug('routes/notification GET, id: ', req.params.id);
    Notification.list(req.params.id).then(function (reply) {
      res.status(200).send({data: reply});
    })
    .catch(function (err) {
      res.status(400).send(err.toString());
    });
  };

  notificationRoute.show = function (req, res) {

  };

  notificationRoute.create = function (req, res) {

  };

  notificationRoute.update = function (req, res) {

  };

  notificationRoute.delete = function (req, res) {

  };

};
