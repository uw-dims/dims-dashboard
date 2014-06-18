var spawn =  require('child_process').spawn;
var tmp = require('tmp');
var async = require('async');
var fs = require('fs');
var util = require('../util');

exports.list = function(req,res) {
    console.log('In crosscor server call');
    var inputArray = ['/opt/dims/bin/crosscor_client', '--server', 'rabbitmq.prisem.washington.edu',
          '--queue-base', 'crosscor'];
    
    console.log(req.query);
    req.query.stats !== undefined ? inputArray.push('-s') : "";
    
    if (req.query.fileName !== undefined) {
      inputArray.push('-r');
      inputArray.push(req.query.fileName);
    }

    if (req.query.iff !== undefined) {
      inputArray.push('-I');
      inputArray.push(req.query.iff);
    }

    if (req.query.mapName !== undefined) {
      inputArray.push('-m');
      inputArray.push(req.query.mapName);
    }

    console.log(inputArray);
    console.log('ready to spawn python process');

          var python = spawn(
            'python',
            inputArray
            );
          util.processPython(python, req, res);
          
  };

