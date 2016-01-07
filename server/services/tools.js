'use strict';

var logger = require('../utils/logger')(module);
var q = require('q');
var ChildProcess = require('../services/childProcess');

/** Gets data from command line tool and anonymizes it if requested */
module.exports = function (UserSettings, anonService) {
  var tools = {};

  tools.getData = function (command, inputArray, id) {
    var deferred = q.defer();
    var child = new ChildProcess();
    var rawData,
        settings;

    child.startProcess(command, inputArray).then(function (reply) {
      // reply is the data
      rawData = reply;
      logger.debug('services/tools.getData Returned from first request. data is ');
      console.log(rawData);
      // Get user settings so we know whether or not the user has requested anonymization
      // TODO: lparsons - may need to add system level value for this as well
      UserSettings.getUserSettings(id).then(function (reply) {
        settings = reply.settings;
        logger.debug('services/tools.getData User settings are ', settings);
        if (!settings.anonymize) {
          logger.debug('services/tools.getData  Do not anonymize - send back data');
          // Send back the raw data
          deferred.resolve(rawData);
        } else {
          logger.debug('services/tools.getData Now will call anonymize.setup. id is ', id);
          // Need to anonymize before sending back
          anonService.setup({data: rawData, useFile: false, type: 'anon'}, settings.rpcDebug, settings.rpcVerbose)
          .then(function (reply) {
            logger.debug('routes/rwfind.list Back from anonymize.setup');
            inputArray = reply;
            var anonChild = new ChildProcess();
            anonChild.startProcess('python', inputArray).then(function (reply) {
              logger.debug('services/tools.getData anon reply is ');
              console.log(reply);
              deferred.resolve(reply);
            }, function (err, reply) {
              logger.debug('services/tools.getData error from anon process ', err, reply);
              deferred.resolve(err);
            });
          }, function (err, reply) {
            logger.debug('services/tools.getData error is ', err, reply);
            deferred.resolve(err);
          });
        }
      }, function (err, reply) {
        logger.debug('services/tools.getData error  is ', err, reply);
        deferred.reject(err);
      });

    }, function (err, reply) {
      logger.debug('services/tools.getData error  is ', err, reply);
      deferred.reject(err);
    });

    return deferred.promise;
  };
  return tools;
};
