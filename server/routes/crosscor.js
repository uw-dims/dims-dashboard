var spawn =  require('child_process').spawn;
var tmp = require('tmp');
var async = require('async');
var fs = require('fs');
var dimsutil = require('../utils/util');
var logger = require('../utils/logger');
var config = require('../config');

exports.list = function(req,res) {

  logger.debug('crosscor:list - Request: ', req.query);

  var rpcQueuebase = config.rpcQueueNames['crosscor'],
      rpcClientApp = 'crosscor_client',
      debug = process.env.NODE_ENV === 'development' ? '--debug' : (req.query.debug === 'true' ? '--debug' : ''),
      verbose = process.env.NODE_ENV === 'development' ? '--verbose' : (req.query.verbose === 'true' ? '--verbose' : '');

  var inputArray = [config.bin + rpcClientApp, debug, verbose, '--server', config.rpcServer,
          '--queue-base', rpcQueuebase];
  
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

