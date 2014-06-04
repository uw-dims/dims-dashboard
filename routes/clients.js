var spawn =  require('child_process').spawn;
var carrier = require('carrier');

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
  var inputArray = ['/opt/dims/bin/rwfind_client', '--debug', '--verbose', '--server', 'rabbitmq.prisem.washington.edu',
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

  console.output(inputArray);

  var python = spawn(
    'python',
    ['/opt/dims/bin/rwfind_client', '--debug', '--verbose', '--server', 'rabbitmq.prisem.washington.edu',
        '--queue-base', 'rwfind', '--topn', '100', '--json', '--start-date',
         '2014/01/03:00', '--end-date', '2014/01/04:00', '--searchfile', 'data/ipsrw6.txt']
    );
  processPython(python, req, res);

};

var processPython = function(python, req, res) {
  var output = '';
  python.stdout.on('data', function(data) {
    output += data
    console.log('stdout: '+ data);
  });

  python.stderr.on('data', function(data) {
    console.log('stderr: ' + data);
  });
  python.on('close', function(code) {
    if (code !== 0) {
      return res.send(500, code, output);
    }
    return res.send(200, output);
  })
}