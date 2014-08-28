var spawn =  require('child_process').spawn;
var tmp = require('tmp');
var async = require('async');
var fs = require('fs');
var util = require('../utils/util');
var logger = require('../utils/logger');

exports.list = function(req,res) {
    var inputArray = ['/opt/dims/bin/cifbulk_client', '--server', 'rabbitmq.prisem.washington.edu',
          '--queue-base', 'cifbulk'];
    
    logger.debug('CIFBULK query - Request: ', req.query);

    req.query.header == 'true' ? inputArray.push('-H') : "";
    req.query.stats == 'true' ? inputArray.push('-s') : "";
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
                  if (err == undefined) {
                     inputArray.push('-r');
                     inputArray.push(path);
                  }
               callback(err);
              });
            } else {
              callback(null);
            }
       }, function(callback) {  
            
          logger.debug('CIFBULK query - Input to python child process: ', inputArray);

          var python = spawn(
            'python',
            inputArray
            );
          util.processPython(python, req, res);
          callback(null, 'done');
        }, function(err,result) {
          console.log('In final cifbulk callback, result is '+ result);
        }
      ])  
  };

