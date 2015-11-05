'use strict';

var config = require('../config/config');
var AmqpLogPublisher = require('./amqpLogPublisher');

// Get log to use from
var amqpConnect = new AmqpLogPublisher(config.appLogExchange, config.fanoutExchanges[config.appLogExchange].durable);
console.log('AmapLogger creating connection');
amqpConnect.createConnection();
amqpConnect.on('ready', function () {
  console.log('AmqpLogger received ready signal');
  amqpConnect.emit('logger-ready');
});

module.exports = amqpConnect;

