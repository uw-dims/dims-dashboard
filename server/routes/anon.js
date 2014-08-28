var spawn =  require('child_process').spawn;
var tmp = require('tmp');
var async = require('async');
var fs = require('fs');
var util = require('../utils/util');
var logger = require('../utils/logger');

exports.list = function(req,res) {
    var inputArray = ['/opt/dims/bin/anon_client', '--server', 'rabbitmq.prisem.washington.edu',
          '--queue-base', 'anon'];
    
    logger.debug('ANON query - Request: ', req.query);
    req.query.stats == 'true' ? inputArray.push('-s') : "";
    if (req.query.outputType == 'json') inputArray.push('-J');
    
    if (req.query.fileName !== undefined) {
      inputArray.push('-r');
      inputArray.push(req.query.fileName);
    }

     if (req.query.mapName !== undefined) {
      inputArray.push('-m');
      inputArray.push(req.query.mapName);
    }

    logger.debug('ANON query - Input to python child process: ', inputArray);

    var python = spawn(
      'python',
      inputArray
      );
    util.processPython(python, req, res);
          
  };

