// 'use strict';

// var test = require('tape');
// var q = require('q');

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

// Bookshelf.plugin('virtuals');

// test.skip('models/user.js: some tests', function (assert) {

//   UserModel.Users.forge()
//   .fetch({ withRelated: ['email']})
//   .then(function (collection) {
//     collection = collection.toJSON();
//     console.log('users: ', collection);
//     var email = collection[0].email;
//     console.log(email);
//     console.log(collection[1].email);
//     console.log(collection[2].email);
//     console.log(collection[3].email);
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });

// });

// test('models/user.js: get email info', function (assert) {
//   UserModel.Email
//   .where({email: 'linda.parsons@nextcentury.com'})
//   .fetch()
//   .then(function (response) {
//     console.log(response.toJSON());
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });
// });

// test.skip('models/user.js: get user list', function (assert) {
//   UserModel.Users.forge()
//       .fetch({ withRelated: ['email']})
//       .then(function (collection) {
//     collection = collection.toJSON();
//     console.log('users: ', collection);
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });
// });

// // test('models/user.js: user with trustgroup', function (assert) {

// //   UserModel.Users.forge()
// //   .fetch({ withRelated: ['trustgroups']})
// //   .then(function (collection) {
// //     collection = collection.toJSON();
// //     console.log('users: ', collection);
// //     assert.end();
// //   })
// //   .catch(function (err) {
// //     console.log(err);
// //     assert.end();
// //   });

// // });

// // test('models/user.js: trustgroups with users', function (assert) {

// //   UserModel.TrustGroups.forge()
// //   .fetch({ withRelated: ['users']})
// //   .then(function (collection) {
// //     collection = collection.toJSON();
// //     console.log('trustgroups: ', collection);
// //     assert.end();
// //   })
// //   .catch(function (err) {
// //     console.log(err);
// //     assert.end();
// //   });

// // });

// test.skip('models/user.js: *trustgroup with users', function (assert) {

//   UserModel.TrustGroup
//   .where({ident: 'test'})
//   .fetch({ withRelated: ['users']})
//   .then(function (collection) {
//     collection = collection.toJSON();
//     console.log('trustgroups: ', collection);
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });

// });

// test.skip('models/user.js: **trustgroup with users', function (assert) {
//   var rawSQL = "SELECT " +
//   "m.ident, m.descr, m.affiliation, m.tz_info, m.im_info, m.tel_info, m.sms_info, "
//   + "m.post_info, m.bio_info, m.airport, m.entered, m.activity, m.image, m.sysadmin, "
//   + "mt.trustgroup, mt.state, mt.email, m.image, m.uuid, mt.admin"
//   + " FROM member m " +
//   "JOIN member_trustgroup mt  ON m.ident = mt.member "
//   + " JOIN trustgroup tg ON tg.ident = mt.trustgroup "
//   + "WHERE tg.ident = ?";

//   Bookshelf.knex.raw(rawSQL, ['dims'])
//   .then(function (collection) {
//     // collection = collection.toJSON();
//     console.log('response', collection.rows);
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     console.log(err.stack);
//     assert.end();
//   });

// });


// // test.skip('models/user.js: TrustGroups with users', function (assert) {
// //   UserModel.MemberTrustGroups.forge()
// //   .fetch({withRelated: ['users', 'trustgroups']})
// //   .then(function (collection) {
// //     console.log('member trust groups', collection.toJSON());
// //     assert.end();
// //   })
// //   .catch(function (err) {
// //     console.log(err);
// //     assert.end();
// //   });
// // });

// // test('models/user.js: One trustGroup with members by trustgroup', function (assert) {
// //   UserModel.MemberTrustGroups
// //   .query('where', 'trustgroup', '=', 'dims')
// //   .fetch()
// //   .then(function (collection) {
// //     console.log('member trust groups', collection.toJSON());
// //     assert.end();
// //   })
// //   .catch(function (err) {
// //     console.log(err);
// //     assert.end();
// //   });
// // });

// test('models/user.js: Trustgroups by member', function (assert) {
//   UserModel.MemberTrustGroups
//   .query('where', 'member', '=', 'lparsons')
//   .fetch()
//   .then(function (collection) {
//     console.log('member trust groups', collection.toJSON());
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });
// });

// // test('models/user.js: Get info for one trust group -  dims', function (assert) {
// //   UserModel.TrustGroups
// //   .query('where', 'ident', '=', 'dims')
// //   .fetch()
// //   .then(function (collection) {
// //     console.log('trust groups', collection.toJSON());
// //     assert.end();
// //   })
// //   .catch(function (err) {
// //     console.log(err);
// //     assert.end();
// //   });
// // });

// // test('models/user.js: get all in member trust groups', function (assert) {
// //   UserModel.MemberTrustGroups.forge()
// //   .fetch()
// //   .then(function (collection) {
// //     console.log('member trust groups', collection.toJSON());
// //     assert.end();
// //   })
// //   .catch(function (err) {
// //     console.log(err);
// //     assert.end();
// //   });
// // });


// // test('models/user.js: TrustGroup with users', function (assert) {
// //   UserModel.MemberTrustGroup
// //   .where('trustgroup', 'test')
// //   .fetch({withRelated: ['users']})
// //   .then(function (collection) {
// //     // Will fail here if null
// //     console.log('member trust groups', collection.toJSON());
// //     assert.end();
// //   })
// //   .catch(function (err) {
// //     console.log(err);
// //     assert.end();
// //   });
// // });

// // Get all trust groups
// // test('models/user.js: Just trust groups', function (assert) {
// //   UserModel.TrustGroups.forge()
// //   .fetch()
// //   .then(function (collection) {
// //     console.log('trust groups', collection.toJSON());
// //     assert.end();
// //   })
// //   .catch(function (err) {
// //     console.log(err);
// //     assert.end();
// //   });
// // });


// // test('models/user.js: get all in mailing lists', function (assert) {
// //   UserModel.MailingLists.forge()
// //   .fetch()
// //   .then(function (collection) {
// //     console.log('mailing Lists', collection.toJSON());
// //     assert.end();
// //   })
// //   .catch(function (err) {
// //     console.log(err);
// //     assert.end();
// //   });
// // });

// // test('models/user.js: get all in member mailing lists', function (assert) {
// //   UserModel.MemberMailingLists.forge()
// //   .fetch()
// //   .then(function (collection) {
// //     console.log('member mailing lists', collection.toJSON());
// //     assert.end();
// //   })
// //   .catch(function (err) {
// //     console.log(err);
// //     assert.end();
// //   });
// // });


// test('finish', function (assert) {
//   knex.destroy(function (err, reply) {
//     console.log(err, reply);
//     assert.end();
//   });
// });

