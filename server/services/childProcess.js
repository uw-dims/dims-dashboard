/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
'use strict';

var logger = require('../utils/logger')(module);
var q = require('q');
var spawn =  require('child_process').spawn;

exports = module.exports = ChildProcess;

function ChildProcess() {
  var self = this;
};

ChildProcess.prototype.startProcess = function (commandProgram, inputArray) {
  var deferred = q.defer();
  var self = this;

  logger.debug('services/childProcess: commandProgram is ', commandProgram);
  logger.debug('services/childProcess: inputArray is ', inputArray);

  // Put in try-catch block

  try {
    self.childProcess = spawn(
      commandProgram,
      inputArray
    );
  } catch (err) {
    logger.error('Error in try-catch block', err);
    throw err;
  }



  self.output = '';
  self.error = '';
  logger.debug('services/childProcess spawned childProcess. Program: ', commandProgram, ', PID: ', self.childProcess.pid);

  // Listener on process stdout - add stdout to output
  self.childProcess.stdout.on('data', function (data) {
    self.output += data;
  });

  // Listener on process stderr - Log it
  self.childProcess.stderr.on('data', function (data) {
    var decoder = new (require('string_decoder').StringDecoder)('utf-8');
    // self.stderr += decoder.write(data);
    logger.debug('services/childProcess %s', decoder.write(data));
  });

  // Listener on process close - send back the resuls in the promise
  self.childProcess.on('close', function (code) {
    logger.debug('services/childProcess closed. PID: ' + self.childProcess.pid + ', code: ' + code);
    if (code !== 0) {
      logger.error('services/childProcess closed with error. PID: %d, code: %s', self.childProcess.pid, code);
      var err = new Error('Child process exited with error code');
      err.code = code;
      err.pid = self.childProcess.pid;
      err.stderr = self.stderr;
      logger.error('services/childProcess err is ', err, err.stack, err.code, err.pid, err.stderr);
      // return res.status(500).json({code: code, pid: childProcess.pid, data: output});
      return deferred.reject(err);
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
