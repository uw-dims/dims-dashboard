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
'use strict';

var logger = require('../utils/logger')(module);
var _ = require('lodash-compat');

module.exports = function (UserModel, Bookshelf) {
  var userService = {};

  // Need this for inner join query
  var sqlQuery = 'SELECT ' +
  'm.ident, m.descr, m.affiliation, m.tz_info, m.im_info, m.tel_info, m.sms_info, ' +
  'm.post_info, m.bio_info, m.airport, m.entered, m.activity, m.image, m.sysadmin, ' +
  'mt.trustgroup, mt.state, mt.email, m.image, m.uuid, mt.admin, tg.descr as tgdesc, ' +
  'me.pgpkey_id, me.pgpkey_expire, me.verified, me.keyring, me.keyring_update_at, ' +
  'me.verify_token ' +
  'FROM member m ' +
  'JOIN member_trustgroup mt  ON m.ident = mt.member ' +
  'JOIN trustgroup tg ON tg.ident = mt.trustgroup ' +
  'JOIN member_email me ON mt.email = me.email ';

  var sqlAddByUser = 'WHERE m.ident = ?';
  var sqlAddByTG = 'WHERE tg.ident = ?';
  var sqlAddByTGUser = 'WHERE tg.ident = ? AND  m.ident = ?';

  var authTgQuery = 'SELECT ' +
  'mt.trustgroup, mt.state, mt.email, tg.descr as tgdesc, mt.admin ' +
  'FROM member_trustgroup mt ' +
  'JOIN trustgroup tg ON tg.ident = mt.trustgroup ' +
  'WHERE mt.member = ?';

  var fieldMapping = {
    ident: 'username',
    descr: 'name',
    affiliation: 'affiliation',
    tgdesc: 'tgDescription',
    tz_info: 'tz',
    im_info: 'im',
    tel_info: 'phone',
    sms_info: 'sms',
    post_info: 'post',
    bio_info: 'bio',
    airport: 'airport',
    entered: 'entered',
    activity: 'activity',
    sysadmin: 'isSysadmin',
    // image: 'image',
    login_attempts: 'loginAttempts',
    login_try_begin: 'loginTryBegin',
    trustgroup: 'trustgroup',
    state: 'state',
    email: 'email',
    uuid: 'uuid',
    admin: 'admin',
    pgpkey_id: 'pgpkeyId',
    pgpkey_expire: 'pgpkeyExpires',
    verified: 'verified',
    keyring: 'keyring',
    keyring_update_at: 'keyringUpdateAt',
    verify_token: 'verifyToken',
    password: 'password'
  };

  var tgFields = {
    ident: 'trustgroup',
    descr: 'trustgroupDesc'
  };

  var tgMapping = {
    ident: 'trustgroup',
    descr: 'trustgroupDesc',
    pgp_required: 'pgpRequired',
    max_inactivity: 'maxInactivity',
    nom_enabled: 'nomEnabled'
  };

  var authMapping = {
    auth: {
      ident: 'username',
      password: 'password'
    },
    session: {
      ident: 'username',
      descr: 'name',
      sysadmin: 'isSysadmin'
    }
  };

  // Fields we want from member_trustgroup when
  // doing auth
  var authTgMapping = {
    auth: {
      state: 'state'
    },
    session: {
      state: 'state',
      tgdesc: 'tgDescription',
      email: 'email',
      admin: 'admin'
    }
  };

  // States a user can login under
  var authStates = [
    'active',
    'soonidle',
    'idle',
    'approved'
  ];


  // will reduce if key is not in mapping
  var applyMapping = function applyMapping(json, mapping) {
    var result = {};
    _.forEach(json, function (value, key) {
      if (_.has(mapping, key)) {
        result[mapping[key]] = value;
      }
    });
    return result;
  };


  // Get info for all trust groups
  var getAllTrustgroups = function getAllTrustgroups() {
    var result = [];
    return UserModel.TrustGroups.forge()
    .fetch()
    .then(function (collection) {
      _.forEach(collection.toJSON(), function (value, index) {
        result.push(applyMapping(value, tgMapping));
      });
      return result;
    })
    .catch(function (err) {
      logger.error(err);
      throw new Error('userService.getAllTrustgroups: ', err);
    });
  };
  // Get info for one trustgroup
  var getOneTrustgroup = function getOneTrustgroup(name) {
    return UserModel.TrustGroup
    .where({ident: name})
    .fetch()
    .then(function (collection) {
      return applyMapping(collection.toJSON(), tgMapping);
    })
    .catch(function (err) {
      logger.error(err);
      throw new Error('userService.getOneTrustgroups: ', err);
    });
  };

  // Get all members in just one trustgroup
  // Gives trustgroup, ident, admin, state, email
  var getUsersByTrustgroup = function getUsersByTrustGroup(name) {
    var result = [];
    return UserModel.MemberTrustGroups
    .query('where', 'trustgroup', '=', name)
    .fetch()
    .then(function (collection) {
      _.forEach(collection.toJSON(), function (value, index) {
        result.push(applyMapping(value, fieldMapping));
      });
      return result;
    })
    .catch(function (err) {
      logger.error(err);
      throw new Error('userService.getOneTrustgroup: ', err);
    });
  };

  // Get all trustgroups a member is in
  var getTrustgroupByUser = function getTrustgroupByUser(user) {
    var result = [];
    return UserModel.MemberTrustGroups
    .query('where', 'member', '=', user)
    .fetch()
    .then(function (collection) {
      _.forEach(collection.toJSON(), function (value, index) {
        result.push(applyMapping(value, fieldMapping));
      });
      return result;
    })
    .catch(function (err) {
      logger.error(err);
      throw new Error('userService.getTrustgroupByUser: ', err);
    });
  };

  // Get user's trustgroups for the purpose of auth
  var getUserAuthTg = function getUserAuthTg(user, type) {
    if (type !== 'auth' && type !== 'session') {
      throw new Error('Invalid type supplied: ', type);
    }
    var result = {},
        sql = authTgQuery,
        binding = [user];
    result.loginTgs = [];
    result.trustgroups = {}
    return Bookshelf.knex.raw(sql, binding)
    .then(function (reply) {
      _.forEach(reply.rows, function (value, index) {
        // value.trustgroup is id of trustgroup
        result.trustgroups[value.trustgroup] = applyMapping(value, authTgMapping[type]);
        // Add trustgroup id to array if state allows login
        if (_.includes(authStates, result.trustgroups[value.trustgroup].state)) {
          result.loginTgs.push(value.trustgroup);
        }
      });
      return result;
    })
    .catch(function (err) {
      logger.error(err);
      throw new Error('userService.getUserAuthTg: ', err);
    });
  };

  // Get info for all users in a trustgroup
  // Returns more info than preceeding methods
  var getUsersInfo = function getUsersInfo(trustgroup, user) {
    var sql, binding,
        getOne,
        result = [];
    // Getting all users
    if (user === undefined) {
      sql = sqlQuery + sqlAddByTG;
      binding = [trustgroup];
      getOne = false;
    } else {
      // Getting one user
      sql = sqlQuery + sqlAddByTGUser;
      binding = [trustgroup, user];
      getOne = true;
    }
    return Bookshelf.knex.raw(sql, binding)
    .then(function (reply) {
      _.forEach(reply.rows, function (value, index) {
        result.push(applyMapping(value, fieldMapping));
      });
      if (getOne) {
        return result[0];
      } else {
        return result;
      }
    })
    .catch(function (err) {
      logger.error(err);
      throw new Error('userService.getUsersInitialInfo: ', err);
    });
  };

  var addEmailInfo = function addEmailInfo(userInfo) {
    return UserModel.Email
      .where({email: userInfo.email})
      .fetch()
      .then(function (response) {
        var result =  response.toJSON();
        _.omit(result, 'member');
        _.extend(userInfo, result);
        return applyMapping(userInfo, fieldMapping);
      })
      .catch(function (err) {
        logger.error(err);
        throw new Error('userService.getEmailInfo: ', err);
      });
  };


  // Throws error if not found
  // Returns ident, password, array of trustgroups
  var getAuthInfo = function getAuthInfo(user, type) {
    if (type !== 'auth' && type !== 'session') {
      throw new Error('Invalid type supplied: ', type);
    }
    var result = {};
    return UserModel.User
    .where({ident: user})
    .fetch()
    .then(function (response) {
      if (response === null) {
        throw new Error('User does not exist');
      }
      result = applyMapping(response.toJSON(), authMapping[type]);
      return getUserAuthTg(result.username, type);
    })
    .then (function (reply) {
      if (_.isEmpty(reply.trustgroups)) {
        throw new Error('User is not in a trust group');
      }
      // Check to see if user can log into any tgs
      if (reply.loginTgs.length === 0) {
        throw new Error('User is not authorized to log into a trust group due to state');
      }
      result.trustgroups = reply.trustgroups;
      result.loginTgs = reply.loginTgs;
      return result;
    })
    .catch(function (err) {
      throw err;
    });
  };

  var getUserLogin = function getUserLogin(user) {
    return getAuthInfo(user, 'auth');
  };

  var getUserSession = function getUserSession(user) {
    return getAuthInfo(user, 'session');
  };

  // userService.getAllTrustgroups = getAllTrustgroups;
  // userService.getOneTrustgroup = getOneTrustgroup;
  // userService.getUsersByTrustgroup = getUsersByTrustgroup;
  userService.getTrustgroupByUser = getTrustgroupByUser;
  userService.getUsersInfo = getUsersInfo;
  userService.getUserLogin = getUserLogin;
  userService.getUserSession = getUserSession;

  return userService;
};


