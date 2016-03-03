/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

 // Change test.skip to test to run these tests. Need to be
 // able to connect to Postgresql server
'use strict';

var test = require('tape');
var q = require('q');

var config = require('../../../config/config');

var dbConfig,
    knex,
    Bookshelf,
    UserModel;

test.skip('model/user/js setup', function (assert) {
  dbConfig = {
    client: 'postgresql',
    connection: {
      host: config.userDBHost,
      user: config.userDBUser,
      database: config.userDatabase
    },
    debug: true
  };

  knex = require('knex')(dbConfig);
  Bookshelf = require('bookshelf')(knex);
  UserModel = require('../../../models/user')(Bookshelf);
  Bookshelf.plugin('virtuals');
  assert.end();
});

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
  .where({email: 'linda.parsons@nextcentury.com'})
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
  + "mt.trustgroup, mt.state, mt.email, m.image, m.uuid, mt.admin"
  + " FROM member m " +
  "JOIN member_trustgroup mt  ON m.ident = mt.member "
  + " JOIN trustgroup tg ON tg.ident = mt.trustgroup "
  + "WHERE tg.ident = ?";

  Bookshelf.knex.raw(rawSQL, ['dims'])
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


// test.skip('models/user.js: TrustGroups with users', function (assert) {
//   UserModel.MemberTrustGroups.forge()
//   .fetch({withRelated: ['users', 'trustgroups']})
//   .then(function (collection) {
//     console.log('member trust groups', collection.toJSON());
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });
// });

// test('models/user.js: One trustGroup with members by trustgroup', function (assert) {
//   UserModel.MemberTrustGroups
//   .query('where', 'trustgroup', '=', 'dims')
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

test.skip('models/user.js: Trustgroups by member', function (assert) {
  UserModel.MemberTrustGroups
  .query('where', 'member', '=', 'lparsons')
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

// test('models/user.js: Get info for one trust group -  dims', function (assert) {
//   UserModel.TrustGroups
//   .query('where', 'ident', '=', 'dims')
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

// test('models/user.js: get all in member trust groups', function (assert) {
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


// test('models/user.js: TrustGroup with users', function (assert) {
//   UserModel.MemberTrustGroup
//   .where('trustgroup', 'test')
//   .fetch({withRelated: ['users']})
//   .then(function (collection) {
//     // Will fail here if null
//     console.log('member trust groups', collection.toJSON());
//     assert.end();
//   })
//   .catch(function (err) {
//     console.log(err);
//     assert.end();
//   });
// });

// Get all trust groups
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


// test('models/user.js: get all in mailing lists', function (assert) {
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

// test('models/user.js: get all in member mailing lists', function (assert) {
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

