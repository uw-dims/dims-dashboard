var amqp = require('amqplib');
var logger = require('../utils/logger');
var config = require('../config');
var net = require('net');


 module.exports = function() {
  var user = 'rpc_user';
  var pwd = 'rpcm3pwd';
  var port = '5672';
  var server = 'localhost';
  
  var fanoutName = 'logs';
  var fanoutType = 'fanout';


  this.subscribeFanout = function() {

    var open = amqp.connect('amqp://'+ server).then(function(conn) {

      process.once('SIGINT', function() { conn.close(); });
      
      return conn.createChannel().then(function(ch) {
        console.log('this fanoutName is '+ fanoutName);

        var ok = ch.assertExchange(fanoutName, fanoutType, {durable: false});

        ok = ok.then(function() {
          console.log('Now will asserQueue');
          return ch.assertQueue('', {exclusive: true});
        });

        ok = ok.then(function(qok) {
          console.log('Now will bindQueue');
          return ch.bindQueue(qok.queue, fanoutName, '').then(function() {
            console.log('Now will return qok');
            return qok.queue;
          });
        });

        ok = ok.then(function(queue) {
          console.log('Now will consume');
          return ch.consume(queue, logMessage, {noAck: true});
        });

        return ok.then(function() {
          console.log(' [*] Waiting for logs. To exit press CTRL+C');
        });

        function logMessage(msg) {
          console.log(" [x] '%s'", msg.content.toString());
        }
      });

    }).then(null, console.warn);
  };
  
};