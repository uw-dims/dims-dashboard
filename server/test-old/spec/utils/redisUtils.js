'use strict';

//var redisDB = require('../../../utils/redisDB');
//var redis = require('redis');
var q = require('q');
var logger = require('../../../utils/logger');

// Redis mock
var redis = require('redis-js');
var client = redis.createClient();
var db = require('../../../utils/redisUtils')(client);

var failOnError = function(err) {
  logger.debug('TEST: Error ', err);
  expect('Error').to.equal('Success');
};

describe('utils/redisUtils', function() {

  // Perform first - flush the database
  // before(function(done) {
  //   redisDB.flushdb(function(reply) {
  //     done();
  //   });
  // });

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
