'use strict';

// File: test/spec/routes/tickets.js

// Mock server - need to figure out how to move this and still
// be able to access everything in it

// var express = require('express'),
//   ROOT_DIR = __dirname + '/../../..',
//   config = require(ROOT_DIR + '/config'),
//   bodyParser = require('body-parser'),
//   methodOverride = require('method-override'),
//   session = require('express-session'),
//   logger = require(ROOT_DIR + '/utils/logger'),
//   errorHandler = require('errorhandler'),
//   routes = require(ROOT_DIR + '/routes');

// var app = express();

// var env = process.env.NODE_ENV || 'development';

// app.use(bodyParser.urlencoded({
//   extended: false
// }));
// app.use(bodyParser.json());
// app.use(methodOverride());

// // development only
// if (env === 'development') {
//   app.use(errorHandler());
//   app.use(function(err, req, res, next) {
//         res.status(err.status || 500);
//         res.render('error', {
//             message: err.message,
//             error: err
//         });
//     });
// }

// var router = express.Router();
// router.get('/tickets', require(ROOT_DIR+'/routes/tickets').list);
// router.get('/tickets/:id', require(ROOT_DIR+'/routes/tickets').show);

// app.use('/', router);

// // Allows to require files relative to the root in any file
// var requireFromRoot = (function(root) {
//   return function(resource) {
//     return require(root+'/'+resource);
//   }
// })(ROOT_DIR);

// // end mock server

// var Ticket = require('../../../models/ticket');
// var logger = require('../../../utils/logger');
// var KeyGen = require('../../../models/keyGen');

// // var app = require('../../../app');

// var request = require('supertest');

// // Bootstrap some data
// var user = 'testUser'; // Simulates logged in user

// var topicName1 = 'topicHashData',
//     topicDataType1 = 'hash',
//     topicContents1 = {
//       'field1':'value1',
//       'field2':'value2'
//     },
//     topicName2 = 'topicSetData',
//     topicDataType2 = 'set',
//     // Set to one value until jenkins redis is updated from 2.2.10
//     topicContents2 = [ 'aaaaa'];

// describe ('routes/tickets', function(done) {

//   var ticket = new Ticket();
//   var ticketKey;

//   before(function(done) {

//     ticket.create({ creator: user, type: 'mitigation'}).then(function(ticket) {
//       ticketKey = KeyGen.ticketKey(ticket);
//       done();
//     });
//   });

//   it('should get the ticket', function(done){
//     logger.debug('ticket is ', ticket);
//     logger.debug('ticket key is ', ticketKey);
//     request(app).get('/tickets')
//       .expect(200)
//       .end(function(err, res) {
//         expect('1').to.equal('1');
//         logger.debug('end of test, res is ', res);
//         logger.debug('end of test, err is ', err);
//         done();
//       });
//   });

// });