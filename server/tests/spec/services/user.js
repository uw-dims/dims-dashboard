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

 // Requires user database to test. Change test.skip to test to run
 // Some tests may need to be revised due to changes in user service

'use strict';

var test = require('tape');

var config = require('../../../config/config');

var dbConfig,
    knex,
    Bookshelf,
    UserModel,
    userService;

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
  userService = require('../../../services/user')(UserModel, Bookshelf);
  assert.end();
});


test.skip('services/user.js: get Auth info', function (assert) {
  userService.getUserLogin('lparsons')
  .then(function (reply) {
    console.log('Auth info', reply);
    assert.end();
  })
  .catch(function (err) {
    console.log(err.toString());
    assert.end();
  });
});

test.skip('services/user.js: get Session info', function (assert) {
  userService.getUserSession('lparsons')
  .then(function (reply) {
    console.log('Session info', reply);
    assert.end();
  })
  .catch(function (err) {
    console.log(err.toString());
    assert.end();
  });
});

test.skip('services/user.js: get Auth info for invalid user', function (assert) {
  userService.getUserLogin('bob')
  .then(function (reply) {
    console.log(reply);
    assert.end();
  })
  .catch(function (err) {
    console.log(err.toString());
    assert.end();
  });
});

test.skip('services/user.js: get Auth info for user not in trust group', function (assert) {
  userService.getUserLogin('lindacolby7797')
  .then(function (reply) {
    console.log(reply);
    assert.end();
  })
  .catch(function (err) {
    console.log(err.toString());
    assert.end();
  });
});

test.skip('services/user.js: get info for all trust groups', function (assert) {
  userService.getAllTrustgroups()
  .then(function (reply) {
    console.log(reply);
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });
});

test.skip('services/user.js: get info for one trust groups', function (assert) {
  userService.getOneTrustgroup('dims')
  .then(function (reply) {
    console.log(reply);
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });
});

test.skip('services/user.js: get all members in one trust groups', function (assert) {
  userService.getUsersByTrustgroup('dims')
  .then(function (reply) {
    console.log(reply);
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });
});

test.skip('services/user.js: get all trustgroups a user is in', function (assert) {
  userService.getTrustgroupByUser('lparsons')
  .then(function (reply) {
    console.log(reply);
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });
});

test.skip('services/user.js: get info for one user', function (assert) {
  userService.getUsersInfo('dims', 'lparsons')
  .then(function (reply) {
    console.log(reply);
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });
});

test.skip('services/user.js: get info for all users in a trust group', function (assert) {
  userService.getUsersInfo('dims')
  .then(function (reply) {
    console.log(reply);
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });
});

test.skip('services/user.js: get info for all users in tg', function (assert) {
  userService.getUsersInfo('dims')
  .then(function (reply) {
    console.log(reply);
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });
});

test.skip('services/user.js: get info for all users', function (assert) {
  userService.getUsersInitialInfo('dims', 'lparsons')
  .then(function (reply) {
    console.log(reply);
    assert.end();
  })
  .catch(function (err) {
    console.log(err);
    assert.end();
  });
});

test.skip('finish', function (assert) {
  knex.destroy(function (err, reply) {
    console.log(err, reply);
    assert.end();
  });
});

