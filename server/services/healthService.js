'use strict';

var config = require('../config/config');
var healthLogger = require('../utils/healthLogger');

module.exports = function healthService(UserModel) {
  var checkHealth = function checkHealth() {
    healthLogger.publish('dashboard healthy');
    checkPostgres();
  };

  var checkPostgres = function checkPostgres() {
    UserModel.Users.forge()
    .fetch({ withRelated: ['email']})
    .then(function (reply) {
      healthLogger.publish('postgresql healthy at postgresql://' + config.userDBHost + '/' + config.userDatabase);
    })
    .catch(function (err) {
      healthLogger.publish('postgresql unhealthy at postgresql://' + config.userDBHost + '/' + config.userDatabase + '. Error: ', err.toString());
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

