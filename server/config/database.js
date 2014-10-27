var userDB = {};
var cacheDB = {};

var exports = module.exports = {};

userDB = {
  'connection' : 'postgres://localhost/ops-trust'
};

exports.userDB = userDB;
exports.cacheDB = cacheDB;