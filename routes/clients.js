var spawn =  require('child_process').spawn;
var carrier = require('carrier');

exports.anon = function(req, res) {
  console.log('In anon server call');
  var python = spawn(
    'python',
    ['/opt/dims/bin/anon_client', '--debug', '--verbose', '--server', 'rabbitmq.prisem.washington.edu',
        '--queue-base', 'anon', '--stats', '--file', 'data/rwfind_201210011617_8428.txt']
    );
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
