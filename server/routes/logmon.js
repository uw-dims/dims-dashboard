 /**
  * currently not used - deprecated

var config = require('../config');
var logger = require('../utils/logger');
var Fanout = require('../services/fanout.js');

var logmon = null;
var logmon = new Fanout('logs');

var startEvent = 'fanout:logs:started';
var stopEvent = 'fanout:logs:stopped'

logger.debug('logmon: logmon created new Fanout named logs.');

exports.start = function(req, res) {
  
  // Start the logmonitor if it is not running
  if (!logmon.running) {
    // Setup listener for successful start
    logmon.once(startEvent, function() {
      res.status(200).send('Logmonitor started\n');
    });
    // Setup listener for error

    // Start the logmonitor
    logmon.start();
 
  } else {
    // Just return a response
    logmon.start();  // try to start it anyway - for debugging
    res.status(200).send('Logmonitor was already running\n');

  }
};

exports.stop = function(req, res) {

  if (logmon.running) {
    //Setup listener for successful stop
    logmon.once(stopEvent, function() {
      res.status(200).send('Logmonitor stopped\n');
    });

    // Setup listener for error

    // Stop the logmonitor
    logmon.stop();

  } else {
    // Just return response
    logmon.stop(); // try to stop it anyway - for debugging
    res.status(200).send('Logmonitor was not running\n');
  }
  
};

exports.status = function(req, res) {
  return res.status(200).send('Logmonitor status: ' + logmon.status() + '\n');
};

*/

