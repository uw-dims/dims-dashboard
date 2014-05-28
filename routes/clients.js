var spawn =  require('child_process').spawn;
var carrier = require('carrier');

exports.anon = function(req, res) {
  console.log('In anon');
};

exports.ipgrep = function(req,res) {
  console.log('In ipgrep');
  
  
};

exports.cifbulk = function(req,res) {
  console.log('In cifbulk');
};

exports.crosscor = function(req,res) {
  console.log('In crosscor');
};