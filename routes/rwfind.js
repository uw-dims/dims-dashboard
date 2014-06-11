var spawn =  require('child_process').spawn;
// var carrier = require('carrier');
var tmp = require('tmp');
var async = require('async');
var fs = require('fs');
var util = require('../util');

exports.list = function(req,res) {
    console.log('In rwfind server call');
    var inputArray = ['/opt/dims/bin/rwfind_client', '--server', 'rabbitmq.prisem.washington.edu',
          '--queue-base', 'rwfind'];
    
    console.log(req.query);
    req.query.header !== undefined ? inputArray.push('-H') : "";
    if (req.query.hitLimit !== undefined) {
      inputArray.push('-T')
      inputArray.push(req.query.hitLimit);
    } 
    if (req.query.numDays !== undefined) {
      inputArray.push('-D')
      inputArray.push(req.query.numDays);
    } 
    if (req.query.outputType == 'json') inputArray.push('-J');
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
            tmp.file(function _tempFileCreated(err, path, fd) {
             
              console.log('File: ', path);
              console.log('Filedescriptor: ', fd);
              callback(err,path,fd);
            });
     
        },function(path, fd, callback) {
            if (req.query.ips !== undefined) {
              fs.writeFile(path, req.query.ips, function(err) {
                  if (err == undefined) {
                     inputArray.push('-r');
                     inputArray.push(path);
                  }
               callback(err);
              });
            }
       }, function(callback) {  
            
          console.log('In last callback, inputArray is: ');
          console.log(inputArray);

          var python = spawn(
            'python',
            inputArray
            );
          util.processPython(python, req, res);
          callback(null, 'done');
        }, function(err,result) {
          console.log('In final callback, tasks are '+ result);
        }
      ])  
  };

