var spawn =  require('child_process').spawn;
var tmp = require('tmp');
var async = require('async');
var fs = require('fs');
var dimsutil = require('../utils/util');
var logger = require('../utils/logger');
var config = require('../config');

exports.list = function(req,res) {

  logger.debug('rwfind:list - Request query is: ', req.query);

  var rpcQueuebase = config.rpcQueueNames['rwfind'],
      rpcClientApp = 'rwfind_client',
      // debug = process.env.NODE_ENV === 'development' ? '--debug' : (req.query.debug === 'true' ? '--debug' : ''),
      // verbose = process.env.NODE_ENV === 'development' ? '--verbose' : (req.query.verbose === 'true' ? '--verbose' : '');

      inputArray = [config.bin + rpcClientApp, '--server', config.rpcServer,
        '--queue-base', rpcQueuebase];
  
  req.query.debug === 'true' ? inputArray.push ('--debug') : '';
  req.query.verbose === 'true' ? inputArray.push ('--verbose') : '';

  req.query.header === 'true' ? inputArray.push('-H') : '';

  if (req.query.hitLimit !== undefined) {
    inputArray.push('-T')
    inputArray.push(req.query.hitLimit);
  } 
  if (req.query.numDays !== undefined) {
    inputArray.push('-D')
    inputArray.push(req.query.numDays);
  } 
  if (req.query.outputType === 'json') inputArray.push('-J');
  if (req.query.startTime !== undefined) {
    inputArray.push('--stime');
    inputArray.push(req.query.startTime);
  }
  if (req.query.endTime !== undefined) {
    inputArray.push('--etime');
    inputArray.push(req.query.endTime);
  }
  if (req.query.fileName !== undefined) {
    inputArray.push('-r');
    inputArray.push(req.query.fileName);
  }

    async.waterfall([
        function(callback) {
          if (req.query.ips !== undefined) {
            tmp.file(function _tempFileCreated(err, path, fd) {
              logger.debug('rwfind temp file created error: ', err);
              logger.debug('rwfind temp file created path: ' + path);
              logger.debug('rwfind temp file created fd: ' + fd);
              callback(err,path,fd);
            });
          } else {
            callback(null, null, null);
          }
          
        },function(path, fd, callback) {
            logger.debug('rwfind writefile path: ' + path);
            logger.debug('rwfind req.query.ips: ', req.query.ips);
            if (req.query.ips !== undefined ) {
              fs.writeFile(path, req.query.ips, function(err) {
                  logger.debug('rwfind writefile error: ' + err);
                  if (err === undefined || err === null) {
                     logger.debug('rwfind writefile error is null or undefined');
                     inputArray.push('-r');
                     inputArray.push(path);
                  }
               callback(err);
              });
            } else {
              callback(null);
            }

       }, function(callback) {  
            
          logger.debug('rwfind:list - Input to python child process: ', inputArray);
          
          var python = spawn(
            'python',
            inputArray
            );
          dimsutil.processPython(python, req, res);
          callback(null, 'done');
        }, function(err,result) {
        }
      ]);  
  };

