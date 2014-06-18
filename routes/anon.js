var spawn =  require('child_process').spawn;
// var carrier = require('carrier');
var tmp = require('tmp');
var async = require('async');
var fs = require('fs');
var util = require('../util');

exports.list = function(req,res) {
    console.log('In anon server call');
    var inputArray = ['/opt/dims/bin/anon_client', '--server', 'rabbitmq.prisem.washington.edu',
          '--queue-base', 'anon'];
    
    console.log(req.query);
    req.query.stats == 'true' ? inputArray.push('-s') : "";
    if (req.query.outputType == 'json') inputArray.push('-J');
    
    if (req.query.fileName !== undefined) {
      inputArray.push('-r');
      inputArray.push(req.query.fileName);
    }

     if (req.query.mapName !== undefined) {
      inputArray.push('-m');
      inputArray.push(req.query.mapName);
    }

    console.log(inputArray);

          var python = spawn(
            'python',
            inputArray
            );
          util.processPython(python, req, res);
          
  };

