var spawn =  require('child_process').spawn;
var tmp = require('tmp');
var async = require('async');
var fs = require('fs');
var dimsutil = require('../utils/util');
var logger = require('../utils/logger');
var config = require('../config');

exports.list = function(req,res) {

  logger.debug('anon:list - Request: ', req.query);


  console.log(req.query );

  var fullBody = '';

  req.on('data', function(chunk)
    {
      // append current chunk
      fullBody += chunk.toString();
    });

  req.on('end', function() {

    var rpcQueuebase = config.rpcQueueNames['anon'],
      rpcClientApp = 'anon_client',
      ipgrepApp = 'ipgrep';
      // debug = process.env.NODE_ENV === 'development' ? '--debug' : (req.query.debug === 'true' ? '--debug' : ''),
      // verbose = process.env.NODE_ENV === 'development' ? '--verbose' : (req.query.verbose === 'true' ? '--verbose' : '');



    if (req.query.type === 'ipgrep') {
      var inputArray = [config.bin + ipgrepApp, '-a', '--context', '-v', '-n', '/opt/dims/src/prisem/rpc/ipgrep_networks_prisem.txt'];
      var commandProgram = 'perl';
    } else {
      var commandProgram = 'python';
      var inputArray = [config.bin + rpcClientApp, '--server', config.rpcServer,
            '--queue-base', rpcQueuebase]; 
      req.query.debug === 'true' ? inputArray.push ('--debug') : '';
      req.query.verbose === 'true' ? inputArray.push ('--verbose') : '';

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
    }

    async.waterfall([
      function(callback) {
         if (fullBody !== '') {
          tmp.file(function _tempFileCreated(err, path, fd) {
            callback(err,path,fd);
          });
        } else {
          callback(null, null, null);
        }
   
      },function(path, fd, callback) {
          if (fullBody !== '') {
            fs.writeFile(path, fullBody, function(err) {
                if (err === undefined || err === null) {
                  if (req.query.type !== 'ipgrep') {
                    inputArray.push('-r');
                  } 
                  inputArray.push(path);
                }
             callback(err);
            });
          } else {
            callback(null);
          }
     }, function(callback) {  
          
        logger.debug('anon:list - Input to python child process:', inputArray);
        console.log(inputArray);
        try {
          var child = spawn(
            commandProgram,
            inputArray
          );
          dimsutil.processPython(child, req, res);
        } catch (e) {
          log.error(e);
        }   
        
        callback(null, 'done');
      }, function(err,result) {
      }
    ]); 

  });

   

};

