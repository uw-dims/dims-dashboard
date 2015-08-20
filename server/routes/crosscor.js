'use strict';

// var spawn =  require('child_process').spawn;
var dimsutil = require('../utils/util');
var logger = require('../utils/logger')(module);
var config = require('../config/config');

module.exports = function (tools) {
  var crosscor = {};

  crosscor.list = function (req, res) {

    logger.debug('crosscor:list - Request: ', req.query);

    if (!req.user) {
      return res.status(500).send('Error: user is not defined in request');
    }
    var id = req.user.get('ident');

    var rpcQueuebase = config.rpcQueueNames.crosscor,
        rpcClientApp = 'crosscor_client',
        // debug = process.env.NODE_ENV === 'development' ? '--debug' : (req.query.debug === 'true' ? '--debug' : ''),
        // verbose = process.env.NODE_ENV === 'development' ? '--verbose' : (req.query.verbose === 'true' ? '--verbose' : '');

        inputArray = [config.rpcbin + rpcClientApp, '--server', config.rpcServer,
            '--queue-base', rpcQueuebase];
    if (req.query.debug === 'true') {
      inputArray.push ('--debug');
    }
    if (req.query.verbose === 'true') {
      inputArray.push ('--verbose');
    }
    if (req.query.stats === 'true') {
      inputArray.push('-s');
    }
    if (req.query.fileName !== undefined) {
      inputArray.push('-r');
      inputArray.push(req.query.fileName);
    }
    if (req.query.iff !== undefined) {
      inputArray.push('-I');
      inputArray.push(req.query.iff);
    }
    if (req.query.mapName !== undefined) {
      inputArray.push('-m');
      inputArray.push(req.query.mapName);
    }

    logger.debug('crosscor:list - Input to python child process: ', inputArray);
    return tools.getData('python', inputArray, id)
    .then(function (reply) {
      console.log(reply);
      logger.debug('routes/crosscor.list - Send 200 reply');
      return res.status(200).send(reply);
    })
    .catch(function (err) {
      logger.error('routes/crosscor.js catch block caught error: ', err);
      return res.status(500).send(err);
    });
  };

  return crosscor;

};

