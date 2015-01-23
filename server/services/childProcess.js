'use strict';

var config = require('../config');
var logger = require('../utils/logger');
var q = require('q');
var spawn =  require('child_process').spawn;

exports = module.exports = ChildProcess;

function ChildProcess() {

	var self = this;

};

ChildProcess.prototype.startProcess = function(commandProgram, inputArray) {
	var deferred = q.defer();
	var self = this;

	logger.debug('services/childProcess: commandProgram is ', commandProgram);
	logger.debug('services/childProcess: inputArray is ', inputArray);

  // Put in try-catch block

	self.childProcess = spawn(
      commandProgram,
      inputArray
    );

  self.output = '';
  logger.debug('services/childProcess spawned childProcess. Program: ', commandProgram, ', PID: ', self.childProcess.pid);
  
  // Listener on process stdout - add stdout to output
  self.childProcess.stdout.on('data', function(data) {
    self.output += data;
  });

  // Listener on process stderr - Log it
  self.childProcess.stderr.on('data', function(data) {
    var decoder = new (require('string_decoder').StringDecoder)('utf-8');
    logger.info('services/childProcess stderr %s', decoder.write(data));
  });

  // Listener on process close - send back the resuls in the promise
  self.childProcess.on('close', function(code) {
    logger.debug('services/childProcess closed. PID: '+ self.childProcess.pid + ', code: ' + code);
    if (code !== 0) {
      logger.error('services/childProcess closed with error. PID: %d, code: %s', self.childProcess.pid, code);
      // return res.status(500).json({code: code, pid: childProcess.pid, data: output});
      return deferred.reject({code: code, pid: self.childProcess.pid, data: self.output});
    }
    // try {
    //   // Some of our tools return data with extra line returns
    //   var jsonOutput = JSON.parse(self.output);
    //   jsonOutput = JSON.stringify(jsonOutput);
    //   // return res.status(200).json({pid: childProcess.pid, data: jsonOutput});
    //   return deferred.resolve({pid: self.childProcess.pid, data: jsonOutput});
      
    // } catch (e) {
    //   // return res.status(200).json({pid: childProcess.pid, data: output});
    //   return deferred.resolve({pid: self.childProcess.pid, data: self.output});
    // } 
    // Don't do JSON parsing here
    return deferred.resolve(self.output);
  });

  return deferred.promise;

};