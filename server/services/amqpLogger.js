'use strict';

var config = require('../config/config');
var AmqpLogPublisher = require('./amqpLogPublisher');

// var logger = {};
var amqpConnect = new AmqpLogPublisher(config.fanoutExchanges.logs.name, config.fanoutExchanges.logs.durable);
console.log('AmapLogger creating connection');
amqpConnect.createConnection();
amqpConnect.on('ready', function () {
  console.log('AmqpLogger received ready signal');
  amqpConnect.emit('logger-ready');
});

module.exports = amqpConnect;

