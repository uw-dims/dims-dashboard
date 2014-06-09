var spawn =  require('child_process').spawn;
var carrier = require('carrier');
var tmp = require('tmp');
var async = require('async');
var fs = require('fs');

exports.anon = function(req, res) {
  console.log('In anon server call');
  var python = spawn(
    'python',
    ['/opt/dims/bin/anon_client', '--debug', '--verbose', '--server', 'rabbitmq.prisem.washington.edu',
        '--queue-base', 'anon', '--stats', '--file', 'data/rwfind_201210011617_8428.txt']
    );
  processPython(python, req,res);
};

exports.ipgrep = function(req,res) {
  console.log('In ipgrep server call');
  
  
};

exports.cifbulk = function(req,res) {
  console.log('In cifbulk server call');
};

exports.crosscor = function(req,res) {
  console.log('In crosscor server call');
};

exports.rwfind = function(req,res) {
  console.log('In rwfind server call');
  var inputArray = ['/opt/dims/bin/rwfind_client', '--server', 'rabbitmq.prisem.washington.edu',
        '--queue-base', 'rwfind'];
  
  console.log(req.query);
  req.query.header !== undefined ? inputArray.push('-H') : "";
  if (req.query.hitLimit !== undefined) {
    inputArray.push('-T')
    inputArray.push(req.query.hitLimit);
  } 
  if (req.query.numDays !== undefined) {
    inputArray.push('-D')
    inputArray.push(req.query.numDays);
  } 
  if (req.query.outputType == 'json') inputArray.push('-J');
  if (req.query.startTime !== undefined) {
    inputArray.push('--stime');
    inputArray.push(req.query.startTime);
  }
  if (req.query.endTime !== undefined) {
    inputArray.push('--etime');
    inputArray.push(req.query.endTime);
  }
  if (req.query.fileName !== undefined) {
    inputArray.push('-r');
    inputArray.push(req.query.fileName);
  }

  async.waterfall([
      function(callback) {
          tmp.file(function _tempFileCreated(err, path, fd) {
           
            console.log('File: ', path);
            console.log('Filedescriptor: ', fd);
            callback(err,path,fd);
          });
   
      },function(path, fd, callback) {
          if (req.query.ips !== undefined) {
            fs.writeFile(path, req.query.ips, function(err) {
		if (err == undefined) {
                   inputArray.push('-r');
                   inputArray.push(path);
                }
             callback(err);
            });
          }
     }, function(callback) {  
          
        console.log('In last callback, inputArray is: ');
        console.log(inputArray);

        // var python = spawn(
        //   'python',
        //   ['/opt/dims/bin/rwfind_client', '--debug', '--verbose', '--server', 'rabbitmq.prisem.washington.edu',
        //       '--queue-base', 'rwfind', '--topn', '100', '--json', '--start-date',
        //        '2014/01/03:00', '--end-date', '2014/01/04:00', '--searchfile', 'data/ipsrw6.txt']
        //   );
        var python = spawn(
          'python',
          inputArray
          );
        processPython(python, req, res);
        callback(null, 'done');
      }, function(err,result) {
        console.log('In final callback, tasks are '+ result);
      }
    ])  
};

var processPython = function(python, req, res) {
  var output = '';
  console.log('Spawned child pid: ' + python.pid);
  python.stdout.on('data', function(data) {
    output += data
  });

  python.stderr.on('data', function(data) {
    console.log('stderr: '+ data);
  });
  python.on('close', function(code) {
    console.log("python closed");
    if (code !== 0) {
      return res.json(500, {code: code, pid: python.pid, data: output});
    }
    // For now, change result labels that clients can't handle
    output = output.replace('%_of_total', 'Percent');
    output = output.replace('cumul_%', 'Cumulative');
    return res.send(200, output);
  })
}
