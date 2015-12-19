'use strict';

var logger = require('../utils/logger')(module);
var q = require('q');
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

  // var tgMapping = _.chain(fieldMapping)
  //   .omit('ident', 'descr')
  //   .extend(tgFields)
  //   .value();

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
      throw new Error('userService.getTrustgroupByUser: ', err);
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
        // userInfo.pgpkey_id = result.pgpkey_id;
        // userInfo.verified = result.verified;
        // userInfo.pgpkey_expire = result.pgpkey_expire;
        // userInfo.keyring = result.keyring;
        // userInfo.keyring_update_at = result.keyring_update_at;
        // userInfo.verify_token = result.verify_token;
        return applyMapping(userInfo, fieldMapping);
      })
      .catch(function (err) {
        logger.error(err);
        throw new Error('userService.getEmailInfo: ', err);
      });
  };

  // user is optional
  // var getUsersInfo = function getUsersInfo(trustgroup, user) {
  //   var promises = [],
  //       param;
  //   if (user !== undefined) {
  //     param = [trustgroup, user];
  //   } else {
  //     param = [trustgroup];
  //   }
  //   return getUsersInitialInfo.apply(this, param)
  //   .then(function (reply) {
  //     console.log(reply);
  //     // Iterate over result and get more info from Email model
  //     // _.forEach(reply, function (value, index) {
  //     //   promises.push(addEmailInfo(value));
  //     // });
  //     // return q.all(promises);
  //     return reply;
  //   })
  //   .catch(function (err) {
  //     logger.error(err);
  //     throw new Error('userService.getUsersInfo: ', err);
  //   });
  // };

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
      // response = _.pick(response.toJSON(), 'ident', 'password', 'descr');
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

  // Get login info

  // userService.getAllTrustgroups = getAllTrustgroups;
  // userService.getOneTrustgroup = getOneTrustgroup;
  // userService.getUsersByTrustgroup = getUsersByTrustgroup;
  userService.getTrustgroupByUser = getTrustgroupByUser;
  userService.getUsersInfo = getUsersInfo;
  userService.getUserLogin = getUserLogin;
  userService.getUserSession = getUserSession;

  return userService;

};


