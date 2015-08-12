'use strict';

var logger = require('../utils/logger')(module);
var settings = require('../services/settings');
var ChildProcess = require('../services/childProcess');
var q = require('q');

/** Gets data from command line tool and anonymizes it if requested */
module.exports = function (UserSettings, anonService) {
  var tools = {};
  tools.getData = function (command, inputArray, id) {
    var deferred = q.defer();
    var child = new ChildProcess();
    var rawData;

    child.startProcess(command, inputArray).then(function (reply) {
      // reply is the data
      rawData = reply;
      logger.debug('services/tools.getData Returned from first request. data is ');
      console.log(rawData);

      settings.get(id).then(function (reply) {
        logger.debug('services/tools.getData User settings are ', reply);
        console.log(reply);
        if (reply.anonymize === 'false') {
          console.log(reply.anonymize);
          logger.debug('services/tools.getData  Do not anonymize - send back data');
          // Send back the raw data
          deferred.resolve(rawData);
        } else {
          console.log(reply.anonymize);
          logger.debug('services/tools.getData Now will call anonymize.setup. id is ', id);
          // Need to anonymize before sending back
          anonService.setup({data: rawData, useFile: false, type: 'anon'}, id).then(function (reply) {
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
