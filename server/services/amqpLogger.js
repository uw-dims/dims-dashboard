'use strict';

var config = require('../config/config');
var AmqpLogPublisher = require('./amqpLogPublisher');

module.exports = function (logExchange) {
  var exchange = logExchange;
  var amqpConnect;

  function init() {
    amqpConnect = new AmqpLogPublisher(exchange, config.fanoutExchanges[exchange].durable);
    console.log('AmapLogger creating connection for %s', exchange);
    amqpConnect.createConnection();
    amqpConnect.on('ready', function () {
      console.log('AmqpLogger received ready signal for %s', exchange);
      amqpConnect.emit('logger-ready');
    });
    amqpConnect.on('connection-close', onClose.bind(this));
    // Add publish function
    amqpConnect.pub = function (msg) {
      amqpConnect.channel.publish(exchange, '', new Buffer(msg));
    };
  }

  function onClose() {
    console.log('amqpLogger received connection-close event');
    amqpConnect.removeAllListeners('ready');
    amqpConnect.removeAllListeners('connection-close');
    init();
  }

  init();

  return amqpConnect;
};
