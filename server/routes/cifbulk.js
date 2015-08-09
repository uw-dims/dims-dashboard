'use strict';

var tmp = require('tmp');
var async = require('async');
var fs = require('fs');
var logger = require('../utils/logger');
var config = require('../config/config');
var settings = require('../services/settings');
var ChildProcess = require('../services/childProcess');
var anonymize = require('../services/anonymize');


exports.list = function (req, res) {

  logger.debug('cifbulk:list - Request query is: ', req.query);

  if (!req.user) {
    return res.status(500).send('Error: user is not defined in request');
  }

  var id = req.user.get('ident');
  var userSettings = settings.get(id); // Promise with user settings

  var rpcQueuebase = req.query.queue !== undefined ? req.query.queue : config.rpcQueueNames.cifbulk,
      rpcClientApp = 'cifbulk_client',
      // debug = process.env.NODE_ENV === 'development' ? '--debug' : (req.query.debug === 'true' ? '--debug' : ''),
      // verbose = process.env.NODE_ENV === 'development' ? '--verbose' : (req.query.verbose === 'true' ? '--verbose' : '');
      // debug = req.query.debug !== undefined ? (req.query.debug === 'true' ? '--debug' : '') : '';
      // verbose = req.query.verbose !== undefined ? (req.query.verbose === 'true' ? '--verbose' : '') : '';

      inputArray = [config.bin + rpcClientApp, '--server', config.rpcServer,
        '--queue-base', rpcQueuebase];

  if (req.query.debug === 'true') {
    inputArray.push ('--debug');
  }
  if (req.query.verbose === 'true') {
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
        var child = new ChildProcess();
        child.startProcess('python', inputArray).then(function (reply) {
          // reply is the data
          rawData = reply;
          logger.debug('routes/cifbulk.list Returned from cifbulk request. data is ');
          console.log(rawData);
          userSettings.then(function (reply) {
            logger.debug('routes/cifbulk.list User settings are ', reply);
            if (reply.anonymize === 'false') {
              // Send back the raw data
              return res.status(200).send(rawData);
            } else {
              logger.debug('routes/cifbulk.list Now will call anonymize.setup. id is ', id);
              // Need to anonymize before sending back
              anonymize.setup({data: rawData, useFile: false, type: 'anon'}, id).then(function (reply) {
                logger.debug('routes/cifbulk.list Back from anonymize.setup');
                inputArray = reply;
                var anonChild = new ChildProcess();
                anonChild.startProcess('python', inputArray).then(function (reply) {
                  logger.debug('routes/cifbulk.list anon reply is ');
                  console.log(reply);
                  return res.status(200).send(reply);
                }, function (err, reply) {
                  return res.status(500).send(reply);
                });
              }, function (err, reply) {
                logger.debug('routes/cifbulk.list error is ', err, reply);
              });
            }
          });
        });
        callback(null, 'done');
      }, function (err, result) {
        logger.error('routes/cifbulk.js Error: ', err, result);
      }
    ]);
};

