var spawn =  require('child_process').spawn;
var tmp = require('tmp');
var async = require('async');
var fs = require('fs');
var dimsutil = require('../utils/util');
var logger = require('../utils/logger');
var config = require('../config');

exports.list = function(req,res) {

  logger.debug('anon:list - Request: ', req.query);

  var rpcQueuebase = config.rpcQueueNames['anon'],
      rpcClientApp = 'anon_client',
      debug = process.env.NODE_ENV === 'development' ? '--debug' : (req.query.debug === 'true' ? '--debug' : ''),
      verbose = process.env.NODE_ENV === 'development' ? '--verbose' : (req.query.verbose === 'true' ? '--verbose' : '');

  var inputArray = [config.bin + rpcClientApp, debug, verbose, '--server', config.rpcServer,
          '--queue-base', rpcQueuebase];
  
  req.query.stats === 'true' ? inputArray.push('-s') : '';

  if (req.query.outputType == 'json') inputArray.push('-J');
  
  if (req.query.mapName !== undefined) {
    inputArray.push('-m');
    inputArray.push(req.query.mapName);
  }

  

  if (req.query.fileName !== undefined) {
    inputArray.push('-r');
    inputArray.push(req.query.fileName);
  }

  async.waterfall([
    function(callback) {
       if (req.query.inputData !== undefined) {
        tmp.file(function _tempFileCreated(err, path, fd) {
          callback(err,path,fd);
        });
      } else {
        callback(null, null, null);
      }
 
    },function(path, fd, callback) {
        if (req.query.inputData !== undefined) {
          fs.writeFile(path, req.query.inputData, function(err) {
              if (err === undefined || err === null) {
                 inputArray.push('-r');
                 inputArray.push(path);
              }
           callback(err);
          });
        } else {
          callback(null);
        }
   }, function(callback) {  
        
      logger.debug('anon:list - Input to python child process:', inputArray);
      try {
        var python = spawn(
          'python',
          inputArray
        );
        dimsutil.processPython(python, req, res);
      } catch (e) {
        log.error(e);
      }   
      
      callback(null, 'done');
    }, function(err,result) {
    }
  ]);  

};

