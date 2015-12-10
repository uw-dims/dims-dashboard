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
  'mt.trustgroup, mt.state, mt.email, m.image, m.uuid, mt.admin ' +
  'FROM member m ' +
  'JOIN member_trustgroup mt  ON m.ident = mt.member ' +
  'JOIN trustgroup tg ON tg.ident = mt.trustgroup ' +
  'WHERE tg.ident = ?';

  var sqlAddOn = 'AND m.ident = ?';

  var fieldMapping = {
    ident: 'username',
    descr: 'name',
    affiliation: 'affiliation',
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
    image: 'image',
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

  // var tgMapping = _.chain(fieldMapping)
  //   .omit('ident', 'descr')
  //   .extend(tgFields)
  //   .value();

  console.log(fieldMapping);
  console.log(tgMapping);

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

  // Get info for all users in a trustgroup
  // Returns more info than preceeding methods
  var getUsersInitialInfo = function getUsersInitialInfo(trustgroup, user) {
    var sql, binding;
    // Getting all users
    console.log(trustgroup);
    console.log(user);
    if (user === undefined) {
      sql = sqlQuery;
      binding = [trustgroup];
    } else {
      // Getting one user
      sql = sqlQuery + sqlAddOn;
      binding = [trustgroup, user];
    }
    console.log(sqlQuery);
    console.log(binding);
    return Bookshelf.knex.raw(sql, binding)
    .then(function (collection) {
      return collection.rows;
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
  var getUsersInfo = function getUsersInfo(trustgroup, user) {
    var promises = [],
        param;
    if (user !== undefined) {
      param = [trustgroup, user];
    } else {
      param = [trustgroup];
    }
    return getUsersInitialInfo.apply(this, param)
    .then(function (reply) {
      // Iterate over result and get more info from Email model
      _.forEach(reply, function (value, index) {
        promises.push(addEmailInfo(value));
      });
      return q.all(promises);
    })
    .catch(function (err) {
      logger.error(err);
      throw new Error('userService.getUsersInfo: ', err);
    });
  };

  // Throws error if not found
  var getAuthInfo = function getAuthInfo(user) {
    return UserModel.User
    .where({ident: user})
    .fetch()
    .then(function (response) {
      if (response === null) {
        throw new Error('User does not exist');
      }
      response = _.pick(response.toJSON(), 'ident', 'password', 'descr');
      console.log(response);
      return applyMapping(response, fieldMapping);
    })
    .catch(function (err) {
      logger.error(err);
      throw err;
    });
  }

  // Get login info

  userService.getAllTrustgroups = getAllTrustgroups;
  userService.getOneTrustgroup = getOneTrustgroup;
  userService.getUsersByTrustgroup = getUsersByTrustgroup;
  userService.getTrustgroupByUser = getTrustgroupByUser;
  userService.getUsersInfo = getUsersInfo;
  userService.getAuthInfo = getAuthInfo;

  return userService;

};


