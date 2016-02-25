// 'use strict';

// var test = require('tape');

// var _ = require('lodash-compat');
// var q = require('q');

// var config = require('../../../config/config');

// var bluebird = require('bluebird');
// var redis = require('redis');
// var client = bluebird.promisifyAll(redis.createClient());
// bluebird.promisifyAll(client.multi());
// process.env.NODE_DEBUG = redis;
// client.selectAsync(10).then (function (reply) {
// })
// .catch(function (err) {
//   console.error(err.toString());
// });

// var dbConfig = {
//   client: 'postgresql',
//   connection: {
//     host: config.userDBHost,
//     user: config.userDBUser,
//     database: config.userDatabase
//   },
//   debug: true
// };

// var knex = require('knex')(dbConfig);
// var Bookshelf = require('bookshelf')(knex);
// var UserModel = require('../../../models/user')(Bookshelf);
// var userService = require('../../../services/user')(UserModel, Bookshelf);
// var UserSettings = require('../../../models/userSettings')(client);
// var access = require('../../../services/authorization')(userService, UserSettings);

// Bookshelf.plugin('virtuals');

// var failOnError = function (err, assert) {
//   console.log(err);
//   assert.fail(err);
//   assert.end();
// };

// test('authorizations', function (assert) {
//   var username = 'lparsons';
//   return access.authorizations(username)
//   .then(function (reply) {
//     console.log('authorizations for ', username);
//     console.log(reply);
//     assert.end();
//   })
//   .catch(function (err) {
//     failOnError(err, assert);
//   });
// });

// test('finish', function (assert) {
//   client.flushdbAsync()
//   .then(function (reply) {
//     return client.quitAsync();
//   })
//   .then(function (reply) {
//     knex.destroy(function (err, reply) {
//       console.log(err, reply);
//       assert.end();
//     });
//   })
//   .catch(function (err) {
//     console.error(err.toString());
//     assert.end();
//   });

// });
