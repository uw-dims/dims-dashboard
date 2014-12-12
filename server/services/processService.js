'use strict';

var config = require('../config');
var logger = require('./logger');
var q = require('q');
var spawn =  require('childProcess_process').spawn;

exports = module.exports = ChildProcess;

function ChildProcess() {

	var self = this;

};

ChildProcess.prototype.startProcess = function(commandProgram, inputArray) {
	var deferred = q.defer();
	var self = this;

	logger.debug('services/childProcess: commandProgram is ', commandProgram);
	logger.debug('services/childProcess: inputArray is ', inputArray);

	var self.childProcess = spawn(
      commandProgram,
      inputArray
    );

  self.output = '';
  logger.debug('services/childProcess spawned childProcess. Program: ', program, ', PID: ', self.childProcess.pid);
  
  // Listener on process stdout - add stdout to output
  self.childProcess.stdout.on('data', function(data) {
    self.output += data;
  });

  // Listener on process stderr - Log it
  self.childProces.stderr.on('data', function(data) {
    var decoder = new (require('string_decoder').StringDecoder)('utf-8');
    logger.info('services/childProcess stderr %s', decoder.write(data));
  });

  // Listener on process close - send back the resuls in the promise
  self.childProcess.on('close', function(code) {
    logger.debug('services/childProcess closed. PID: '+ childProcess.pid + ', code: ' + code);
    if (code !== 0) {
      logger.error('services/childProcess closed with error. PID: %d, code: %s', childProcess.pid, code);
      // return res.status(500).json({code: code, pid: childProcess.pid, data: output});
      return deferred.reject({code: code, pid: childProcess.pid, data: output});
    }
    try {
      var jsonOutput = JSON.parse(output);
      // return res.status(200).json({pid: childProcess.pid, data: jsonOutput});
      
    } catch (e) {
      // return res.status(200).json({pid: childProcess.pid, data: output});
    } 
  });

  return deferred.promise;

};