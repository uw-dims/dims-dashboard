'use strict';

var logger = require('../utils/logger')(module);
var q = require('q');
var ChildProcess = require('../services/childProcess');
var config = require('../config/config');
var _ = require('lodash-compat');

module.exports = function () {
  var tupelo = {};

  var tupeloActions = {
    'findHashes': '/opt/dims/bin/tupelo.amqp.search'
  };

  var connectionString = 'amqp://' + config.rpcUser + ':' + config.rpcPass + '@' + config.rpcServer + '/%2F';

  tupelo.findHashes = function findHashes(hashArray) {
    var inputArray = [],
        child = new ChildProcess(),
        action = 'findHashes',
        deferred = q.defer();

    inputArray.push(tupeloActions[action]);
    inputArray.push('-u');
    inputArray.push(connectionString);
    inputArray.push('-json');
    _.forEach(hashArray, function (value) {
      inputArray.push(value + ' ');
    });

    console.log('inputArray is ', inputArray);

    child.startProcess('bash', inputArray)
    // child.startProcess('ls', inputArray)
    .then(function (reply) {
      logger.debug('findHashes reply', reply);
      return deferred.resolve(reply);
    })
    .catch(function (err) {
      logger.error('error returned from findHashes', err);
      return deferred.reject(err.toString());
    });
    return deferred.promise;
  };
  return tupelo;
};

