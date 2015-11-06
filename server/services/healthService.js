'use strict';

var config = require('../config/config');
var healthLogger = require('../utils/healthLogger');

module.exports = function healthService(UserModel) {
  var checkHealth = function checkHealth() {
    healthLogger.publish('Dashboard server is running');
    checkPostgres();
  };

  var checkPostgres = function checkPostgres() {
    UserModel.Users.forge()
    .fetch({ withRelated: ['email']})
    .then(function (reply) {
      healthLogger.publish('PostgreSQL service is available.');
    })
    .catch(function (err) {
      healthLogger.publish('PostgreSQL service is not available. Error: ', err.toString());
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

