var amqp = require('amqplib');
var logger = require('../utils/logger');
var config = require('../config');
// var net = require('net');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(RabbitConnection, EventEmitter);

exports = module.exports = RabbitConnection;

function RabbitConnection(name, type) {
  var self = this;
  self.user = 'rpc_user';
  self.pwd = 'rpcm3pwd';
  self.port = '5672';
  // self.server = 'rabbitmq.prisem.washington.edu';
  self.server = config.rpcServer;
  
  // name: exchange
  self.name = name || 'logs';
  // type: type of exchange
  self.type = type || 'fanout';
  if (self.type === 'fanout') {
    self.durable = false;
  } else {
    self.durable = true;
  }

  EventEmitter.call(self);

  self.open = amqp.connect('amqp://'+ self.user+':'+self.pwd+'@'+self.server);

  logger.debug('New RabbitConnection called');
};

RabbitConnection.prototype.subscribe = function() {

    var self = this;
    logger.debug('RabbitConnection.subscribe started');
    self.open.then(function(conn) {
      // Save the connection so it can be closed later
      logger.debug('RabbitConnect.subscribe: open promise');
      self.conn = conn;
      self.conn.on('close', function() {
        logger.debug('RabbitConnection received connection close event');
        self.emit('connectionClose');
      });

      self.conn.on('error', function(err) {
        logger.debug('RabbitConnection received connection error event', err);
        self.emit('connectionError', err);
      });

      logger.debug('RabbitConnection:subscribe: Connection Opened');
      
      // Create the channel
      var ok = self.conn.createChannel();

      ok = ok.then(function(ch) {
        self.ch = ch;
        logger.debug('RabbitConnection:subscribe: Channel created, number: ',ch.ch);

        self.ch.on('close', function() {
          logger.debug('RabbitConnection received channel close event');
          // console.log(this);
          self.ch = null;
          self.emit('channelClose');
        });

        self.ch.on('error', function(err) {
          logger.debug('RabbitConnection received channel error event', err);
          // console.log(this);
          self.emit('channelError', err);
        });

        var ok = ch.assertExchange(self.name, self.type, {durable: self.durable});
        self.pubsubexchange = ok;
        ok = ok.then(function() {
          logger.debug('RabbitConnection:subscribe: Exchange Asserted');
          return ch.assertQueue('', {exclusive: true});
        });

        ok = ok.then(function(qok) {
          logger.debug('RabbitConnection:subscribe: Queue asserted', qok);
          // qok contains queue (aka name), messageCount, consumerCount
          return ch.bindQueue(qok.queue, self.name, '').then(function() {
            logger.debug('RabbitConnection:subscribe: Bind queue');
            self.queueName = qok.queue;
            return qok.queue;
          });
        });

        ok = ok.then(function(queue) {
          logger.debug('RabbitConnection:subscribe: Consume Queue.');
          return ch.consume(queue, logMessage, {noAck: true});
        });

        return ok.then(function() {
          // Waiting for logs
          // Emit the ready event to notify listeners
          logger.debug('RabbitConnection:subscribe: Ready.');
          self.emit('ready', {'queue': self.queueName, 'ch': self.ch.ch });
        });

        function logMessage(msg) {
          // Need to output this somewhere else
          // Will use socket.io
          //console.log(" [x] '%s'", msg.content.toString());
          logger.debug('RabbitConnection:subscribe: Msg', msg.content.toString());
          self.emit(self.name+':receive', msg.content.toString());
        }
      });

    }).then(null, console.warn);
  };

  RabbitConnection.prototype.initPublish = function() {

    var self = this;
    logger.debug('RabbitConnection.publish started');
    self.open.then(function(conn) {
      // Save the connection so it can be closed later
      logger.debug('RabbitConnect.publish: open promise');
      self.conn = conn;
      self.conn.on('close', function() {
        logger.debug('RabbitConnection received connection close event');
        self.emit('connectionClose');
      });

      self.conn.on('error', function(err) {
        logger.debug('RabbitConnection received connection error event', err);
        self.emit('connectionError', err);
      });

      logger.debug('RabbitConnection:publish: Connection Opened');
      
      // Create the channel
      var ok = self.conn.createChannel();

      ok = ok.then(function(ch) {
        self.ch = ch;
        logger.debug('RabbitConnection:publish: Channel created, number: ',ch.ch);

        self.ch.on('close', function() {
          logger.debug('RabbitConnection received channel close event');
          // console.log(this);
          self.ch = null;
          self.emit('channelClose');
        });

        self.ch.on('error', function(err) {
          logger.debug('RabbitConnection received channel error event', err);
          // console.log(this);
          self.emit('channelError', err);
        });

        return self.pubExchange = ch.assertExchange(self.name, self.type, {durable: self.durable});
      });
    });
        // ok = ok.then(function() {
        //   logger.debug('RabbitConnection:subscribe: Exchange Asserted');
        //   return ch.assertQueue('', {exclusive: true});
        // });

        // ok = ok.then(function(qok) {
        //   logger.debug('RabbitConnection:publish: Queue asserted', qok);
        //   // qok contains queue (aka name), messageCount, consumerCount


        //   return ch.bindQueue(qok.queue, self.name, '').then(function() {
        //     logger.debug('RabbitConnection:subscribe: Bind queue');
        //     self.queueName = qok.queue;
        //     return qok.queue;
        //   });
        // });

        // ok = ok.then(function(queue) {
        //   logger.debug('RabbitConnection:subscribe: Consume Queue.');
        //   return ch.consume(queue, logMessage, {noAck: true});
        // });

        // return self.pubsubexchange.then(function() {
        //   self.ch.publish(self.name, '', new Buffer(message));
        //   // Waiting for logs
        //   // Emit the ready event to notify listeners
        //   logger.debug('RabbitConnection:publish: Send mesage: ',message);
        //   // self.emit('ready', {'queue': self.queueName, 'ch': self.ch.ch });
        // });

        // function logMessage(msg) {
        //   // Need to output this somewhere else
        //   // Will use socket.io
        //   //console.log(" [x] '%s'", msg.content.toString());
        //   logger.debug('RabbitConnection:subscribe: Msg', msg.content.toString());
        //   self.emit('msg', msg.content.toString());
        // }
      };

RabbitConnection.prototype.publish = function(message) {
  var self = this;
  return self.pubExchange.then(function() {
          self.ch.publish(self.name, '', new Buffer(message));
          // Waiting for logs
          // Emit the ready event to notify listeners
          logger.debug('RabbitConnection:publish: Send mesage: ',message);
          // self.emit('ready', {'queue': self.queueName, 'ch': self.ch.ch });
        });
};


