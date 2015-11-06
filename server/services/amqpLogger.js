'use strict';

var config = require('../config/config');
var AmqpLogPublisher = require('./amqpLogPublisher');

module.exports = function (exchange) {
  var amqpConnect = new AmqpLogPublisher(exchange, config.fanoutExchanges[exchange].durable);
  console.log('AmapLogger creating connection for %s', exchange);
  amqpConnect.createConnection();
  amqpConnect.on('ready', function () {
    console.log('AmqpLogger received ready signal for %s', exchange);
    amqpConnect.emit('logger-ready');
  });
  // Add publish function
  amqpConnect.pub = function (msg) {
    amqpConnect.channel.publish(exchange, '', new Buffer(msg));
  };
  return amqpConnect;
};

