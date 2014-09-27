var RabbitConnection = require('../services/rabbitConnection');
var config = require('../config');
var logger = require('../utils/logger');
var fanout;

exports.start = function(req, res) {
  console.log('logmon start');
  // var rpc = new RpcConnection();
  // var subscribed = rpc.subscribeFanout();
  if (fanout) {
  	console.log('fanout already exists');
  	console.log(fanout.ch);

  } else {
  	console.log('creating new fanout');
  	fanout = new RabbitConnection('logs', 'fanout');
  }
  // logger.debug(fanout.open);
  // logger.debug(process.pid);
  fanout.subscribe();
  return res.status(200).send('Subscribed to fanout');
};

exports.stop = function(req, res) {
  console.log('logmon stop');
  if (fanout) {
  	console.log('fanout exists');
  	try {
  		fanout.conn.close();
  		console.log('fanout closed');
  		fanout = null;
  	} catch (alreadyClosed) {
  		console.log('alreadyClosed');
  		fanout = null;
  	}
  } else {
  	console.log('no fanout exists');
  }
  return res.status(200).send('Fanout closed');
};

exports.status = function(req, res) {
  console.log('logmon status');
};