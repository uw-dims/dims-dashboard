'use strict';

var tmp = require('tmp');
var async = require('async');
var fs = require('fs');
var logger = require('../utils/logger')(module);
var config = require('../config/config');

module.exports = function (tools) {
  var rwfind = {};
  rwfind.list = function (req, res) {

    logger.debug('routes/rwfind.list - Request query is: ', req.query);

    if (!req.user) {
      return res.status(500).send('Error: user is not defined in request');
    }
    var id = req.user.username;

    var rpcQueuebase = config.rpcQueueNames.rwfind,
        rpcClientApp = 'rwfind_client',

        inputArray = [config.rpcbin + rpcClientApp, '--server', config.rpcServer,
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
    if (req.query.hitLimit !== undefined) {
      inputArray.push('-T');
      inputArray.push(req.query.hitLimit);
    }
    if (req.query.numDays !== undefined) {
      inputArray.push('-D');
      inputArray.push(req.query.numDays);
    }
    if (req.query.outputType === 'json') {
      inputArray.push('-J');
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
      function (callback) {
        // ips were passed - write to file
        if (req.query.ips !== undefined) {
          tmp.file(function _tempFileCreated(err, path, fd) {
            logger.debug('rwfind temp file created error: ', err);
            logger.debug('rwfind temp file created path: ' + path);
            logger.debug('rwfind temp file created fd: ' + fd);
            callback(err, path, fd);
          });
        } else {
          callback(null, null, null);
        }

      }, function (path, fd, callback) {
        logger.debug('rwfind writefile path: ' + path);
        logger.debug('rwfind req.query.ips: ', req.query.ips);
        if (req.query.ips !== undefined) {
          fs.writeFile(path, req.query.ips, function (err) {
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

      }, function (callback) {

        logger.debug('routes/rwfind.list - Input to python child process: ', inputArray);

        return tools.getData('python', inputArray, id)

          .then(function (reply) {
            console.log(reply);
            logger.debug('routes/rwfind.list - Send 200 reply');
            return res.status(200).send(reply);
          })
          .catch(function (err) {
            logger.error('routes/rwfind.js catch block caught error: ', err);
            return res.status(500).send(err);
          });

        callback(null, 'done');
      }, function (err, result) {
        logger.debug('routes/rwfind.js err, result: ', err, result);
      }
    ]);
  };

  return rwfind;
};

