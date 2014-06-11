var spawn =  require('child_process').spawn;
// var carrier = require('carrier');
var tmp = require('tmp');
var async = require('async');
var fs = require('fs');
var util = require('../util');

exports.list = function(req,res) {
    console.log('In anon server call');
    var inputArray = ['/opt/dims/bin/anon_client', '--server', 'rabbitmq.prisem.washington.edu',
          '--queue-base', 'anon'];
    
    console.log(req.query);
    req.query.stats !== undefined ? inputArray.push('-s') : "";
    if (req.query.outputType == 'json') inputArray.push('-J');
    
    if (req.query.fileName !== undefined) {
      inputArray.push('-r');
      inputArray.push(req.query.fileName);
    }

     if (req.query.mapFile !== undefined) {
      inputArray.push('-m');
      inputArray.push(req.query.mapFile);
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

