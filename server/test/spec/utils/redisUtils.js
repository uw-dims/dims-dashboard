'use strict';

var db = require('../../../utils/redisUtils');
var redisDB = require('../../../utils/redisDB');
var redis = require('redis');
var q = require('q');
var logger = require('../../../utils/logger');

var failOnError = function(err) {
  logger.debug('TEST: Error ', err);
  expect('Error').to.equal('Success');
};

describe('utils/redisUtils', function() {

  // Perform first - flush the database
  before(function(done) {
    redisDB.flushdb(function(reply) {
      done();
    });
  });

  describe('#hmset', function(done) {
    it('should receive success reply of ok', function(done) {
      var data = { one: 'one', two: 'two'};
      var key = 'test:redisUtils:1';
      db.hmset(key, data).then(function(reply) {
        expect(reply).to.equal('OK');
        done();
      }, function(err) {
          failOnError(err.toString());
        }).done();
    });
  });

});
