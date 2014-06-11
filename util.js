module.exports = {


  processPython: function(python, req, res) {
    var output = '';
    console.log('Spawned child pid: ' + python.pid);
    python.stdout.on('data', function(data) {
      output += data;
    });

    python.stderr.on('data', function(data) {
      console.log('stderr: '+ data);
    });
    python.on('close', function(code) {
      console.log("python closed");
      if (code !== 0) {
        return res.json(500, {code: code, pid: python.pid, data: output});
      }
   
      return res.send(200, output);
    })
  }

}