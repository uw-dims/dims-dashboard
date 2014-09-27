var amqp = require('amqplib');
var logger = require('../utils/logger');
var config = require('../config');
var net = require('net');

exports = module.exports = RabbitConnection;

function RabbitConnection(name, type) {
  var self = this;
  self.user = 'rpc_user';
  self.pwd = 'rpcm3pwd';
  self.port = '5672';
  self.server = 'localhost';
  
  // name: exchange
  self.name = name || 'logs';
  // type: type of exchange
  self.type = type || 'fanout';
  if (self.type === 'fanout') {
    self.durable = false;
  } else {
    self.durable = true;
  }
  self.open = amqp.connect('amqp://'+ self.server);
};

RabbitConnection.prototype.subscribe = function() {

    // var open = amqp.connect('amqp://'+ server);
    var self = this;
    self.open.then(function(conn) {
      // Save the connection so it can be closed later
      self.conn = conn;
      logger.debug('RabbitConnection:subscribe: Connection Opened');
      
      // Create the channel
      var ok = self.conn.createChannel();

      ok = ok.then(function(ch) {
        logger.debug('RabbitConnection:subscribe: Channel created');
        self.ch = ch;
        console.log(ch);
        var ok = ch.assertExchange(self.name, self.type, {durable: self.durable});

        ok = ok.then(function() {
          logger.debug('RabbitConnection:subscribe: Exchange Asserted');
          return ch.assertQueue('', {exclusive: true});
        });

        ok = ok.then(function(qok) {
          logger.debug('RabbitConnection:subscribe: Queue asserted', qok.queue);

          return ch.bindQueue(qok.queue, self.name, '').then(function() {
            logger.debug('RabbitConnection:subscribe: Bind queue');
            return qok.queue;
          });
        });

        ok = ok.then(function(queue) {
          logger.debug('RabbitConnection:subscribe: Consume Queue.');
          return ch.consume(queue, logMessage, {noAck: true});
        });

        return ok.then(function() {
          // Waiting for logs
          console.log(' [*] Waiting for logs.');
        });

        function logMessage(msg) {
          // Need to output this somewhere else
          console.log(" [x] '%s'", msg.content.toString());
        }
      });

    }).then(null, console.warn);

// module.exports = function() {
//   var user = 'rpc_user';
//   var pwd = 'rpcm3pwd';
//   var port = '5672';
//   var server = 'localhost';
  
//   var fanoutName = 'logs';
//   var fanoutType = 'fanout';


//   this.subscribeFanout = function() {

//     var open = amqp.connect('amqp://'+ server);

//     open.then(function(conn) {

//       console.log('pid is ' + process.pid);

//       process.once('SIGINT', function() { conn.close(); });

//       console.log(conn);

//       var ok = conn.createChannel();

//       ok = ok.then(function(ch) {
//         console.log('this fanoutName is '+ fanoutName);
//         console.log(ch);

//         var ok = ch.assertExchange(fanoutName, fanoutType, {durable: false});

//         ok = ok.then(function() {
//           console.log('Now will asserQueue');
//           return ch.assertQueue('', {exclusive: true});
//         });

//         ok = ok.then(function(qok) {
//           console.log('Now will bindQueue');
//           return ch.bindQueue(qok.queue, fanoutName, '').then(function() {
//             console.log('Now will return qok');
//             return qok.queue;
//           });
//         });

//         ok = ok.then(function(queue) {
//           console.log('Now will consume');
//           return ch.consume(queue, logMessage, {noAck: true});
//         });

//         return ok.then(function() {
//           console.log(' [*] Waiting for logs. To exit press CTRL+C');
//         });

//         function logMessage(msg) {
//           console.log(" [x] '%s'", msg.content.toString());
//         }
//       });

//     }).then(null, console.warn);

    // var open = amqp.connect('amqp://'+ server).then(function(conn) {

    //   process.once('SIGINT', function() { conn.close(); });
      
    //   return conn.createChannel().then(function(ch) {
    //     console.log('this fanoutName is '+ fanoutName);

    //     var ok = ch.assertExchange(fanoutName, fanoutType, {durable: false});

    //     ok = ok.then(function() {
    //       console.log('Now will asserQueue');
    //       return ch.assertQueue('', {exclusive: true});
    //     });

    //     ok = ok.then(function(qok) {
    //       console.log('Now will bindQueue');
    //       return ch.bindQueue(qok.queue, fanoutName, '').then(function() {
    //         console.log('Now will return qok');
    //         return qok.queue;
    //       });
    //     });

    //     ok = ok.then(function(queue) {
    //       console.log('Now will consume');
    //       return ch.consume(queue, logMessage, {noAck: true});
    //     });

    //     return ok.then(function() {
    //       console.log(' [*] Waiting for logs. To exit press CTRL+C');
    //     });

    //     function logMessage(msg) {
    //       console.log(" [x] '%s'", msg.content.toString());
    //     }
    //   });

    // }).then(null, console.warn);
  };
  
// };