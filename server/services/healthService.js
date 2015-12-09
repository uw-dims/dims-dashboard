'use strict';

var config = require('../config/config');
var healthLogger = require('../utils/healthLogger');
var uuid = require('node-uuid');

module.exports = function healthService(UserModel) {

  var checkHealth = function checkHealth() {
    healthLogger.publish('dashboard healthy', config.healthID);
    checkPostgres();
  };

  var checkPostgres = function checkPostgres() {
    var id = 'postgres';
    UserModel.Users.forge()
    .fetch({ withRelated: ['email']})
    .then(function (reply) {
      healthLogger.publish('postgresql healthy at postgresql://' + config.userDBHost + '/' + config.userDatabase, id);
    })
    .catch(function (err) {
      healthLogger.publish('postgresql unhealthy at postgresql://' + config.userDBHost + '/' + config.userDatabase + '. Error: '+ err.toString(), id);
    })
    .done();
  };

  var run = function run() {
    var minutes = config.healthInterval,
      interval = minutes * 60 * 1000;

    var timeout = setInterval(function () {

      checkHealth();

    }, interval);

  };

  return {
    run: run
  };
};

