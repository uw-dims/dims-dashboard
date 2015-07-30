var spawn =  require('child_process').spawn;
var tmp = require('tmp');
var async = require('async');
var fs = require('fs');
var dimsutil = require('../utils/util');
var logger = require('../utils/logger');
var config = require('../config/config');
var settings = require('../services/settings');

exports.list = function(req,res) {

  logger.debug('crosscor:list - Request: ', req.query);

  if (!req.user) return res.status(500).send('Error: user is not defined in request');
    var id = req.user.get('ident');
    var userSettings = settings.get(id); // Promise with user settings

  var rpcQueuebase = config.rpcQueueNames['crosscor'],
      rpcClientApp = 'crosscor_client',
      // debug = process.env.NODE_ENV === 'development' ? '--debug' : (req.query.debug === 'true' ? '--debug' : ''),
      // verbose = process.env.NODE_ENV === 'development' ? '--verbose' : (req.query.verbose === 'true' ? '--verbose' : '');

      inputArray = [config.bin + rpcClientApp, '--server', config.rpcServer,
          '--queue-base', rpcQueuebase];
  req.query.debug === 'true' ? inputArray.push ('--debug') : '';
  req.query.verbose === 'true' ? inputArray.push ('--verbose') : '';
  req.query.stats === 'true' ? inputArray.push('-s') : "";

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

  var python = spawn(
    'python',
    inputArray
    );

  dimsutil.processPython(python, req, res);

};

