var spawn =  require('child_process').spawn;
var tmp = require('tmp');
var async = require('async');
var fs = require('fs');
var dimsutil = require('../utils/util');
var logger = require('../utils/logger');
var config = require('../config');
var _ = require('lodash');

exports.list = function(req,res) {

  logger.debug('routes/anon.list - Request: ', req.query);
  logger.debug('routes/anon.list - body is ');
  console.log(req.body);
  var fullBody = '';

  logger.debug('type of fullbody is ', typeof fullBody);
  logger.debug('type of req.body is ', typeof req.body);
  logger.debug('req.body is null ', req.body === null);
  logger.debug('req body undefined ', req.body == undefined);
  logger.debug('req.body is empty object ', _.isEmpty(req.body));
  logger.debug('null is empy object ', _.isEmpty(null));

  if (!_.isEmpty(req.body) ) {
    logger.debug('routes/anon.list - setting fullbody');
    if (typeof req.body === 'object' ) fullBody = JSON.stringify(req.body);
    else fullBody = req.body;
  }

  // req.on('data', function(chunk)
  //   {
  //     // append current chunk
  //     // logger.debug('routes/anon req.on.data ', fullBody);
  //     fullBody += chunk.toString();
  //     logger.debug('routes/anon req.on.data ', fullBody);
  //   });

  // req.on('end', function() {
    logger.debug('routes/anon.list - req.on.end reached');
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
      } else {
        // This may be temporary - anon service is not working with new .yml file in /etc
        // so we will explicitly require it
        inputArray.push('-m');
        inputArray.push('/etc/ipgrep_networks.yml');
      }
      if (req.query.fileName !== undefined) {
        inputArray.push('-r');
        inputArray.push(req.query.fileName);
      }
    }

    logger.debug('routes/anon req.on end event; input Array before async is ', inputArray);
    async.waterfall([
      function(callback) {
         if (fullBody !== '') {
          logger.debug('routes/anon req.on end event. fullbody not blank');
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

  // });

   

};

