'use strict';

var config = require('../config/config');
var logger = require('../utils/logger')(module);
var q = require('q');
var _ = require('lodash-compat');
var tmp = require('tmp');
var fs = require('fs');


/**
  * @param {string} params.type "ipgrep" or "anon" or undefined (default is anon).
  * @param {object} params
  * @param {string} params.debug True if debug mode requested
  * @param {string} params.verbose True if verbose mode requested
  * @param {string} params.stats True if stats requested
  * @param {string} params.outputType 'json' if Json output requested
  * @param {string} params.mapName  Path to map to use instead of default
  * @param {string} params.data Data or path to file containing data to be anonymized
  * @param {boolean} params.useFile True if data is in a file
  * @param {string} user  ID of logged in user
  */

module.exports = function () {

  var anonymize = {};

  /** Writes a temporary file with content. Returns promise with path. */
  var _writeTempFile = function (content) {
    var deferred = q.defer();
    var filePath;
    logger.debug('services/anonymize._writeTempFile start');
    tmp.file(function _tempFileCreated(err, path, fd) {
      if (err) {
        deferred.reject(err);
      } else {
        filePath = path;
        fs.writeFile(filePath, content, function (err) {
          if (err) {
            deferred.reject(err);
          } else {
            deferred.resolve(filePath);
          }
        });
      }
    });
    return deferred.promise;
  };

  /** Sets up the command input for the input file. Returns a promise with inputArray. */
  var _setFileInput = function (inputArray, type, useFile, data) {
    var deferred = q.defer();
    logger.debug('services/anonymize._setFileInput type ', type, 'useFile ', useFile, 'inputArray ', inputArray);
    if (type !== 'ipgrep') {
      inputArray.push('-r');
    }
    if (useFile) {
      inputArray.push(data);
      deferred.resolve(inputArray);
    } else {
      _writeTempFile(data).then(function (path) {
        inputArray.push(path);
        logger.debug('services/anonymize._setFileInput after writeTempFile. path is ', path);
        deferred.resolve(inputArray);
      }, function (err, reply) {
        deferred.reject(err);
      });
    }
    return deferred.promise;
  };

  /** Returns the initial inputArray */
  var _setInputs = function (params, rpcDebug, rpcVerbose) {

    logger.debug('services/anonymize._setInputs start: type ', params.type, ' stats ', params.stats, 'rpcDebug', rpcDebug, 'rpcVerbose', rpcVerbose);
    // console.log(params);
    var rpcQueuebase = config.rpcQueueNames.anon,
        rpcClientApp = 'anon_client',
        ipgrepApp = 'ipgrep',
        inputArray;

    if (params.type === 'ipgrep') {
      // Need to fix this - not currently using it
      var inputArray = [config.bin + ipgrepApp, '-a', '--context', '-v', '-n', '/etc/ipgrep_networks.yml'];
    } else {
      // logger.debug('services/anonymize._setInputs. Not ipgrep, so get settings for ', id);
      // UserSettings.getUserSettings(id).then(function (reply) {
      // var settings = reply.settings;
      // logger.debug('service/anonymize._setInputs settings are ', settings);
      var inputArray = [config.rpcbin + rpcClientApp, '--server', config.rpcServer,
          '--queue-base', rpcQueuebase];
      if (rpcDebug === 'true') {
        inputArray.push ('--debug');
      }
      if (rpcVerbose === 'true') {
        inputArray.push ('--verbose');
      }
      if (params.stats === 'true') {
        inputArray.push('-s');
      }
      if (params.outputType === 'json') {
        inputArray.push('-J');
      }
      if (params.mapName !== undefined) {
        inputArray.push('-m');
        inputArray.push(params.mapName);
      } else {
        // This may be temporary - anon service is not working with new .yml file in /etc
        // so we will explicitly require it
        inputArray.push('-m');
        inputArray.push('/etc/ipgrep_networks.yml');
      }
    }
    return inputArray;
  };

  // Returns promise with inputArray
  var setup = function setup(params, rpcDebug, rpcVerbose) {
    // var deferred = q.defer();

    var data = params.data,
        inputArray;
    // var id = user;

    // logger.debug('services/anonymize.setup start. id is ', id);

    if (!params.useFile) {
      logger.debug('services/anonymize.setup - not using file');
      if (typeof params.data === 'object') {
        data = JSON.stringify(data);
      }
      // logger.debug('services/anonymize.setup - data is ', data);
    }
    inputArray = _setInputs(params, rpcDebug, rpcVerbose);
    logger.debug('services/anonymize.setup setInputs returned ', inputArray);
    return _setFileInput(inputArray, params.type, params.useFile, data);
  };

  anonymize.setup = setup;
  return anonymize;
};
