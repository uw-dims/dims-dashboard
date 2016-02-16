'use strict';

var logger = require('../utils/logger')(module);
var q = require('q');
var ChildProcess = require('../services/childProcess');

module.exports = function () {

  var stix = {};

  //stix.extract.fileinfo  $stixpath 2>/dev/null
  //stix.extract.ip -maxTlp green  $stixpath 2>/dev/null

  var stixActions = {
    md5: '/opt/dims/bin/stix.extract.md5',
    ip: '/opt/dims/bin/stix.extract.ip',
    fileinfo: '/opt/dims/bin/stix.extract.fileinfo',
    json: '/opt/dims/bin/stix.extract.json',
    hostname: '/opt/dims/bin/stix.extract.hostname'
  };

  stix.extract = function extract(action, stixPath, tlpLevel) {
    var deferred = q.defer();

    if (!stixActions[action]) {
      // throw new Error('Invalid action supplied');
      // return;
      return deferred.reject('Invalid action supplied');
    }

    var inputArray = [];
    var child = new ChildProcess();

    inputArray.push(stixActions[action]);
    inputArray.push('-maxTlp');
    inputArray.push(tlpLevel);
    inputArray.push(stixPath);

    console.log('inputArray is ', inputArray);

    child.startProcess('bash', inputArray)
    // child.startProcess('ls', inputArray)
    .then(function (reply) {
      logger.debug('extractSummary reply', reply);
      return deferred.resolve(reply);
    })
    .catch(function (err) {
      logger.error('error returned from extractSummary', err);
      return deferred.reject(err.toString());
    });
    return deferred.promise;
  };

  return stix;
};
