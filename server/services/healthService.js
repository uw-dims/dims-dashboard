'use strict';

var config = require('../config/config');
var healthLogger = require('../utils/healthLogger');

module.exports = function healthService(UserModel) {
  var checkHealth = function checkHealth() {
    healthLogger.publish('healthy');
    checkPostgres();
  };

  var checkPostgres = function checkPostgres() {
    UserModel.Users.forge()
    .fetch({ withRelated: ['email']})
    .then(function (reply) {
      healthLogger.publish('healthy postgresql postgresql://' + config.userDBHost + '/' + config.userDatabase);
    })
    .catch(function (err) {
      healthLogger.publish('unhealthy postgresql not available. Error: ', err.toString());
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

