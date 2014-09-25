var RpcConnection = require('../services/rpcConnection');
var config = require('../config');

exports.start = function(req, res) {
  console.log('logmon start');
  var rpc = new RpcConnection();
  var subscribed = rpc.subscribeFanout();
};

exports.stop = function(req, res) {
  console.log('logmon stop');
};

exports.status = function(req, res) {
  console.log('logmon status');
};