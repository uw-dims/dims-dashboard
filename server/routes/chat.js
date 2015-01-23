var rpcConnection = require('../services/rabbitConnection');
var config = require('../config');

exports.start = function(req, res) {
  console.log('chat start');
  // rpc = new rpcConnection.RpcConnection();
  // rpc.subscribeFanout();
};

exports.stop = function(req, res) {
  console.log('chat stop');
};

exports.status = function(req, res) {
  console.log('chat status');
};