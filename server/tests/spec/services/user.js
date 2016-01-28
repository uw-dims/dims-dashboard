// 'use strict';

// var test = require('tape');

// var config = require('../../../config/config');
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

// Bookshelf.plugin('virtuals');

// test('services/user.js: get Auth info', function (assert) {
//   userService.getUserLogin('lparsons')
//   .then(function (reply) {
//     console.log('Auth info', reply);
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err.toString());
//     assert.end();
//   });
// });

// test('services/user.js: get Session info', function (assert) {
//   userService.getUserSession('lparsons')
//   .then(function (reply) {
//     console.log('Session info', reply);
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err.toString());
//     assert.end();
//   });
// });

// test('services/user.js: get Auth info for invalid user', function (assert) {
//   userService.getUserLogin('bob')
//   .then(function (reply) {
//     console.log(reply);
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err.toString());
//     assert.end();
//   });
// });

// test('services/user.js: get Auth info for user not in trust group', function (assert) {
//   userService.getUserLogin('lindacolby7797')
//   .then(function (reply) {
//     console.log(reply);
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err.toString());
//     assert.end();
//   });
// });

// test('services/user.js: get info for all trust groups', function (assert) {
//   userService.getAllTrustgroups()
//   .then(function (reply) {
//     console.log(reply);
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });
// });

// test('services/user.js: get info for one trust groups', function (assert) {
//   userService.getOneTrustgroup('dims')
//   .then(function (reply) {
//     console.log(reply);
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });
// });

// test('services/user.js: get all members in one trust groups', function (assert) {
//   userService.getUsersByTrustgroup('dims')
//   .then(function (reply) {
//     console.log(reply);
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });
// });

// test('services/user.js: get all trustgroups a user is in', function (assert) {
//   userService.getTrustgroupByUser('lparsons')
//   .then(function (reply) {
//     console.log(reply);
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });
// });

// test('services/user.js: get info for one user', function (assert) {
//   userService.getUsersInfo('dims', 'lparsons')
//   .then(function (reply) {
//     console.log(reply);
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });
// });

// test('services/user.js: get info for all users in a trust group', function (assert) {
//   userService.getUsersInfo('dims')
//   .then(function (reply) {
//     console.log(reply);
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });
// });

// test('services/user.js: get info for all users in tg', function (assert) {
//   userService.getUsersInfo('dims')
//   .then(function (reply) {
//     console.log(reply);
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });
// });

// test('services/user.js: get info for all users', function (assert) {
//   userService.getUsersInitialInfo('dims', 'lparsons')
//   .then(function (reply) {
//     console.log(reply);
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });
// });

// test('finish', function (assert) {
//   knex.destroy(function (err, reply) {
//     console.log(err, reply);
//     assert.end();
//   });
// });

