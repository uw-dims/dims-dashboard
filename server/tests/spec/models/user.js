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
  }
};

var knex = require('knex')(dbConfig);
var Bookshelf = require('bookshelf')(knex, {debug: true});

// module we're testing
var UserModel = require('../../../models/user')(Bookshelf);

// Add virtuals plug-in
Bookshelf.plugin('virtuals');

test('models/user.js: some tests', function (assert) {

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

test('models/user.js: some more tests', function (assert) {
  UserModel.TrustGroups.forge()
  .fetch()
  .then(function (collection) {
    console.log('trust groups', collection.toJSON());
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });
});

test('models/user.js: some more tests', function (assert) {
  UserModel.MemberTrustGroups.forge()
  .fetch()
  .then(function (collection) {
    console.log('member trust groups', collection.toJSON());
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });
});

test('models/user.js: some more tests', function (assert) {
  UserModel.MailingLists.forge()
  .fetch()
  .then(function (collection) {
    console.log('mailing Lists', collection.toJSON());
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });
});

test('models/user.js: some more tests', function (assert) {
  UserModel.MemberMailingLists.forge()
  .fetch()
  .then(function (collection) {
    console.log('member mailing lists', collection.toJSON());
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });
});


test('finish', function (assert) {
  knex.destroy(function (err, reply) {
    console.log(err, reply);
    assert.end();
  });
})

