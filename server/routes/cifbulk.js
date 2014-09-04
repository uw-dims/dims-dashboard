var spawn =  require('child_process').spawn;
var tmp = require('tmp');
var async = require('async');
var fs = require('fs');
var dimsutil = require('../utils/util');
var logger = require('../utils/logger');
var config = require('../config');

exports.list = function(req,res) {

    logger.debug('cifbulk:list - Request query is: ', req.query);

    var rpcQueuebase = config.rpcQueueNames['cifbulk'],
        rpcClientApp = 'cifbulk_client',
        debug = process.env.NODE_ENV === 'development' ? '--debug' : (req.query.debug === 'true' ? '--debug' : ''),
        verbose = process.env.NODE_ENV === 'development' ? '--verbose' : (req.query.verbose === 'true' ? '--verbose' : '');

    var inputArray = [config.bin + rpcClientApp, debug, verbose, '--server', config.rpcServer,
          '--queue-base', rpcQueuebase];

    req.query.header === 'true' ? inputArray.push('-H') : "";
    req.query.stats === 'true' ? inputArray.push('-s') : "";

    if (req.query.numDays !== undefined) {
      inputArray.push('-D')
      inputArray.push(req.query.numDays);
    } 
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
              callback(err,path,fd);
            });
          } else {
            callback(null, null, null);
          }
     
        },function(path, fd, callback) {
            if (req.query.ips !== undefined) {
              fs.writeFile(path, req.query.ips, function(err) {
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
            
          logger.debug('cifbulk:list - Input to python child process:', inputArray);

          var python = spawn(
            'python',
            inputArray,
            {cwd: 'logs/rpc'}
          );
          dimsutil.processPython(python, req, res);
          callback(null, 'done');
        }, function(err,result) {
        }
      ]);  
  };

