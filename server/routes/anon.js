'use strict';

var logger = require('../utils/logger');
var config = require('../config/config');
var _ = require('lodash-compat');
var ChildProcess = require('../services/childProcess');
var anonymize = require('../services/anonymize');
var settings = require('../services/settings');

/**
  *
  */

exports.anonymize = function (req, res) {
  var commandProgram,
      inputArray,
      params = req.query;

  if (!req.user) {
    return res.status(500).send('Error: user is not defined in request');
  }
  var id = req.user.get('ident');
  var userSettings = settings.get(id); // Promise with user settings - this or id passed?


  logger.debug('routes/anon.anonymize - Request: ', req.query);

  if (!_.isEmpty(req.body)) {
    logger.debug('routes/anon.anonymize - req.body is not empty');
    params.useFile = false;
    if (_.isEmpty(params.fileName)) {
      params.data = req.body;
    } else {
      return res.status(400).send('Request specified both file and data at the same time');
    }
  } else {
    params.useFile = true;
    if (_.isEmpty(params.fileName) ) {
      res.status(400).send('Request did not contain data or file to anonymize');
    } else {
      params.data = params.fileName;
    }
  }

  if (_.isEmpty(params.type)) {
    params.type = 'anon';
  }
  anonymize.setup(params, id).then(function (reply) {
    inputArray = reply;
    logger.debug('routes/anon.anonymize. Response from anonymize.setup: inputArray = ', inputArray);
    if (req.query.type === 'ipgrep') {
      commandProgram = 'perl';
    } else {
      commandProgram = 'python';
    }
    var child = new ChildProcess();
    child.startProcess(commandProgram, inputArray).then(function (reply) {
      logger.debug('routes/anon.anonymize.setup. ChildProcess returned ', reply);
      return res.status(200).send(reply);
    }, function (err, reply) {
      return res.status(500).send(reply);
    });
  });

};

    // logger.debug('routes/anon.list - req.on.end reached');
    // var rpcQueuebase = config.rpcQueueNames['anon'],
    //   rpcClientApp = 'anon_client',
    //   ipgrepApp = 'ipgrep';
      // debug = process.env.NODE_ENV === 'development' ? '--debug' : (req.query.debug === 'true' ? '--debug' : ''),
      // verbose = process.env.NODE_ENV === 'development' ? '--verbose' : (req.query.verbose === 'true' ? '--verbose' : '');



    // if (req.query.type === 'ipgrep') {
    //   var inputArray = [config.bin + ipgrepApp, '-a', '--context', '-v', '-n', '/opt/dims/src/prisem/rpc/ipgrep_networks_prisem.txt'];
    //   var commandProgram = 'perl';
    // } else {
    //   var commandProgram = 'python';
    //   var inputArray = [config.bin + rpcClientApp, '--server', config.rpcServer,
    //         '--queue-base', rpcQueuebase];
    //   req.query.debug === 'true' ? inputArray.push ('--debug') : '';
    //   req.query.verbose === 'true' ? inputArray.push ('--verbose') : '';

    //   req.query.stats === 'true' ? inputArray.push('-s') : '';
    //   if (req.query.outputType == 'json') inputArray.push('-J');
    //   if (req.query.mapName !== undefined) {
    //     inputArray.push('-m');
    //     inputArray.push(req.query.mapName);
    //   } else {
    //     // This may be temporary - anon service is not working with new .yml file in /etc
    //     // so we will explicitly require it
    //     inputArray.push('-m');
    //     inputArray.push('/etc/ipgrep_networks.yml');
    //   }
    //   if (req.query.fileName !== undefined) {
    //     inputArray.push('-r');
    //     inputArray.push(req.query.fileName);
    //   }
    // }

    // logger.debug('routes/anon req.on end event; input Array before async is ', inputArray);
    // async.waterfall([
    //   function (callback) {
    //      if (fullBody !== '') {
    //       logger.debug('routes/anon req.on end event. fullbody not blank');
    //       tmp.file(function _tempFileCreated(err, path, fd) {
    //         callback(err,path,fd);
    //       });
    //     } else {
    //       callback(null, null, null);
    //     }

    //   },function (path, fd, callback) {
    //       if (fullBody !== '') {
    //         fs.writeFile(path, fullBody, function (err) {
    //             if (err === undefined || err === null) {
    //               if (req.query.type !== 'ipgrep') {
    //                 inputArray.push('-r');
    //               }
    //               inputArray.push(path);
    //             }
    //          callback(err);
    //         });
    //       } else {
    //         callback(null);
    //       }
    //  }, function (callback) {

    //     logger.debug('anon:list - Input to python child process:', inputArray);
    //     console.log(inputArray);
        // try {
        //   var child = spawn(
        //     commandProgram,
        //     inputArray
        //   );
        //   dimsutil.processPython(child, req, res);
        // } catch (e) {
        //   log.error(e);
        // }

        // var child = new ChildProcess();
        // child.startProcess(commandProgram, inputArray).then(function (reply) {
        //   return res.status(200).json(reply);
        // }, function (err, reply) {
        //   return res.status(500).json(reply);
        // });

    //     callback(null, 'done');
    //   }, function (err,result) {
    //   }
    // ]);

  // });


