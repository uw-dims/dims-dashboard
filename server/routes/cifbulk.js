'use strict';

var tmp = require('tmp');
var async = require('async');
var fs = require('fs');
var logger = require('../utils/logger')(module);
var config = require('../config/config');

module.exports = function (UserSettings, tools) {

  var cifbulk = {};

  cifbulk.list = function (req, res) {

    logger.debug('cifbulk:list - Request query is: ', req.query);
    if (!req.user) {
      return res.status(500).send('Error: user is not defined in request');
    }

    var id = req.user.get('ident');

    UserSettings.getUserSettings(id).then(function (reply) {

      logger.debug('cifbulk:list - settings ', reply);
      console.log(reply.settings);

      var settings = reply.settings;

      console.log(req.query.queue);
      console.log(req.query.debug);
      console.log(req.query.verbose);

      var rpcQueuebase = req.query.queue !== undefined ? req.query.queue : settings.cifbulkQueue,
          rpcClientApp = 'cifbulk_client',
          debug = req.query.debug !== undefined ? req.query.debug  : settings.rpcDebug,
          verbose = req.query.verbose !== undefined ? req.query.verbose : settings.rpcVerbose ;

      logger.debug('cifbulk:list - rpcQueuebase, debug, verbose', rpcQueuebase, debug, verbose);

      var inputArray = [config.rpcbin + rpcClientApp, '--server', config.rpcServer,
            '--queue-base', rpcQueuebase];


      if (debug === 'true') {
        inputArray.push ('--debug');
      }
      if (verbose === 'true') {
        inputArray.push ('--verbose');
      }
      if (req.query.header === 'true') {
        inputArray.push('-H');
      }
      if (req.query.stats === 'true') {
        inputArray.push('-s');
      }
      if (req.query.numDays !== undefined) {
        inputArray.push('-D');
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

      var rawData; // Put here so we have access later w/in callback
      // This section is going to be converted to promises

      async.waterfall([
          function (callback) {
            if (req.query.ips !== undefined) {
              tmp.file(function _tempFileCreated(err, path, fd) {
                callback(err, path, fd);
              });
            } else {
              callback(null, null, null);
            }

          }, function (path, fd, callback) {
            if (req.query.ips !== undefined) {
              fs.writeFile(path, req.query.ips, function (err) {
                if (err === undefined || err === null) {
                  inputArray.push('-r');
                  inputArray.push(path);
                }
                callback(err);
              });
            } else {
              callback(null);
            }
          }, function (callback) {

            logger.debug('cifbulk:list - Input to python child process:', inputArray);
            return tools.getData('python', inputArray, id)

            .then(function (reply) {
              console.log(reply);
              logger.debug('routes/cifbulk.list - Send 200 reply');
              return res.status(200).send(reply);
            })
            .catch(function (err) {
              logger.error('routes/cifbulk.js catch block caught error: ', err);
              return res.status(500).send(err);
            });
            callback(null, 'done');
          }, function (err, result) {
            if (err) {
              logger.error('routes/cifbulk.js error:', err);
              return res.status(500).send(err);
            } else {
              logger.debug('routes/cifbulk.js no err. Result: ', err);
            }
          }
        ]);
    // };
    }).catch(function (err) {

    });

  };

  return cifbulk;
};

