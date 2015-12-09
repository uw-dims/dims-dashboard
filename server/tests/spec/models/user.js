'use strict';

var test = require('tape-catch');
var q = require('q');

var config = require('../../../config/config');
var dbConfig = {
  client: 'postgresql',
  connection: {
    host: config.userDBHost,
    user: config.userDBUser,
    database: config.userDatabase
  },
  debug: true
};

var knex = require('knex')(dbConfig);
var Bookshelf = require('bookshelf')(knex);
// module we're testing
var UserModel = require('../../../models/user')(Bookshelf);

// Add virtuals plug-in
Bookshelf.plugin('virtuals');

test.skip('models/user.js: some tests', function (assert) {

  UserModel.Users.forge()
  .fetch({ withRelated: ['email']})
  .then(function (collection) {
    collection = collection.toJSON();
    console.log('users: ', collection);
    var email = collection[0].email;
    console.log(email);
    console.log(collection[1].email);
    console.log(collection[2].email);
    console.log(collection[3].email);
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });

});

test.skip('models/user.js: get email info', function (assert) {
  UserModel.Email
  .where({member: 'testuser1'})
  .fetch()
  .then(function (response) {
    console.log(response.toJSON());
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });
});

test.skip('models/user.js: get user list', function (assert) {
  UserModel.Users.forge()
      .fetch({ withRelated: ['email']})
      .then(function (collection) {
    collection = collection.toJSON();
    console.log('users: ', collection);
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });
});

// test('models/user.js: user with trustgroup', function (assert) {

//   UserModel.Users.forge()
//   .fetch({ withRelated: ['trustgroups']})
//   .then(function (collection) {
//     collection = collection.toJSON();
//     console.log('users: ', collection);
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });

// });

// test('models/user.js: trustgroups with users', function (assert) {

//   UserModel.TrustGroups.forge()
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

test.skip('models/user.js: *trustgroup with users', function (assert) {

  UserModel.TrustGroup
  .where({ident: 'test'})
  .fetch({ withRelated: ['users']})
  .then(function (collection) {
    collection = collection.toJSON();
    console.log('trustgroups: ', collection);
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });

});

test.skip('models/user.js: **trustgroup with users', function (assert) {


  var rawSQL = "SELECT " +
  "m.ident, m.descr, m.affiliation, m.tz_info, m.im_info, m.tel_info, m.sms_info, "
  + "m.post_info, m.bio_info, m.airport, m.entered, m.activity, m.image, m.sysadmin, "
  + "mt.trustgroup, mt.state, mt.email, m.image, m.uuid "
  + " FROM member m " +
  "JOIN member_trustgroup mt  ON m.ident = mt.member "
  + " JOIN trustgroup tg ON tg.ident = mt.trustgroup "
  + "WHERE tg.ident = ?";

  Bookshelf.knex.raw(rawSQL, ['test'])
  .then(function (collection) {
    // collection = collection.toJSON();
    console.log('response', collection.rows);
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    console.log(err.stack);
    assert.end();
  });

});


test.skip('models/user.js: TrustGroups with users', function (assert) {
  UserModel.MemberTrustGroups.forge()
  .fetch({withRelated: ['users', 'trustgroups']})
  .then(function (collection) {
    console.log('member trust groups', collection.toJSON());
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });
});

test.skip('models/user.js: TrustGroups with users', function (assert) {
  UserModel.MemberTrustGroup
  .where({trustgroup: 'test'})
  .fetch({withRelated: ['users', 'trustgroups']})
  .then(function (collection) {
    console.log('member trust groups', collection.toJSON());
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });
});

test.skip('models/user.js: TrustGroup with users', function (assert) {
  UserModel.MemberTrustGroup
  .where('trustgroup', 'test')
  .fetch({withRelated: ['users']})
  .then(function (collection) {
    console.log('member trust groups', collection.toJSON());
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });
});

// test('models/user.js: Just trust groups', function (assert) {
//   UserModel.TrustGroups.forge()
//   .fetch()
//   .then(function (collection) {
//     console.log('trust groups', collection.toJSON());
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });
// });

// test('models/user.js: some more tests', function (assert) {
//   UserModel.MemberTrustGroups.forge()
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

// test('models/user.js: some more tests', function (assert) {
//   UserModel.MailingLists.forge()
//   .fetch()
//   .then(function (collection) {
//     console.log('mailing Lists', collection.toJSON());
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });
// });

// test('models/user.js: some more tests', function (assert) {
//   UserModel.MemberMailingLists.forge()
//   .fetch()
//   .then(function (collection) {
//     console.log('member mailing lists', collection.toJSON());
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });
// });


test('finish', function (assert) {
  knex.destroy(function (err, reply) {
    console.log(err, reply);
    assert.end();
  });
});

