'use strict'

var test = require('tape');

var logger = require('../../../utils/logger');
var dimsUtils = require('../../../utils/util');
var q = require('q');
var _ = require('lodash');
var stream = require('stream');
var util = require('util');

// Redis mock
// We will use blocking form for simplicity in test assertions
var redis = require('redis-js');
var client = redis.createClient();

// Need db as File argument.
var db = require('../../../utils/redisUtils')(client);
var keyGen = require('../../../models/keyGen');
// var c = require('../../../config/redisScheme');

var FileData = require('../../../models/fileData')(db);

// Bootstrap some data
var user1 = 'testUser1'; // Simulates logged in user
var user2 = 'testUser2';
var contents1 = 'Contents1';
var contents2 = 'Contents2';
var fileMeta1 = {
  creator: user1,
  description: 'description',
  path: 'boxes/',
  global: true
};

var contentStreamWriter = {
  writer: function writer() {
    var self = this;
    self.string = "";
    stream.Writeable.call(self);

    self._write = function (chunk, encoding, callback) {
      self.string += chunk.toString();
      callback();
    };
    util.inherits(self, stream.Writeable);
  }
};

var contentStreamWriterFactory = function contentStreamWriterFactory() {
  return (_.extend({}, contentStreamWriter));
};


test('FileData.fileFactory should return file object', function (assert) {
  var newFile = FileData.fileFactory();
  assert.ok(newFile instanceof Error, 'Empty options should return error object');
  newFile = FileData.fileFactory({
    creator: 'user'
  });
  assert.ok(newFile instanceof Error, 'Options missing description should return error object');
  newFile = FileData.fileFactory({
    description: 'description'
  });
  assert.ok(newFile instanceof Error, 'Options missing creator should return error object');
  newFile = FileData.fileFactory({
    creator: 'user',
    description: 'A new file'
  });
  assert.equal(newFile.path, '', 'Defaults should work');
  assert.equal(newFile.global, false, 'Defaults should work');
  assert.equal(newFile.creator, 'user', 'Required options should work');
  assert.equal(newFile.description, 'A new file', 'Required options should work');
  newFile = FileData.fileFactory({
    creator: 'user',
    description: 'A new file',
    global: true
  });
  assert.equal(newFile.global, true, 'Options should override defaults');
  assert.end();
});

// test('FileData save should save file contents and key', function (assert) {
//   var newFile = FileData.fileFactory();
//   newFile.save('global', user1, 'boxes/', 'file1', contents1)
//   .then(function (reply) {
//     var content = client.get(keyGen.fileKey(newFile));
//     assert.equal(content, contents1);
//     var metadata = client.hgetall(KeyGen.fileMetaKey(newFile));
//     logger.debug('fileData.test metadata: ', metadata);
//     // assert.deepEqual(metadata, newFile.getFileMetaData());
//     var rank = client.zrank(KeyGen.fileSetKey(newFile), KeyGen.fileKey(newFile));
//     assert.ok(client.zrank(KeyGen.fileSetKey(newFile), KeyGen.fileKey(newFile)) === 0);
//     assert.end();
//   }).catch(function (err) {
//     logger.debug(err);
//   });
// });

test('FileData content should handle stream', function (assert) {
  var source = stream.PassThrough();
  var newFile = FileData.fileFactory(fileMeta1);
  source.pipe(FileData.writer(newFile));
  source.write('first part, ');
  source.write('second part');
  source.end();
  // This doesn't really handle the async...
  var content = client.get(keyGen.fileKey(newFile));
  assert.equal(content, 'first part, second part');

  assert.end();
});

test('FileData save should save key of file in set of keys', function (assert) {
  assert.end();
});

test('FileData save should return file object', function (assert) {
  assert.end();
});

test('FileData.getMetaData should return config object from file object', function (assert) {
  assert.end();
});
