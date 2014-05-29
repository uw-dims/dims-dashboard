var spawn =  require('child_process').spawn;
var carrier = require('carrier');

exports.anon = function(req, res) {
  console.log('In anon server call');
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