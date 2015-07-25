'use strict'

var test = require('tape');

var _ = require('lodash');
var stream = require('stream');

var logger = require('../../../utils/logger');

// Redis mock
// We will use blocking form for simplicity in test assertions
var redis = require('redis-js');
var client = redis.createClient();

// Need db as File argument.
var db = require('../../../utils/redisUtils')(client);
var keyGen = require('../../../models/keyGen');
var extract = require('../../../models/keyExtract');
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
  global: true,
  name: 'main.txt'
};

test('FileData.fileDataFactory should return file object', function (assert) {
  var newFile = FileData.fileDataFactory(fileMeta1);
  assert.equal(typeof (newFile.save), 'function', 'Object should have save function');
  assert.equal(typeof (newFile.getFileMetadata), 'function', 'Object should have getMetaData function');
  assert.ok(newFile.hasOwnProperty('creator'), 'Object should have creator property');
  assert.ok(newFile.hasOwnProperty('description'), 'Object should have description property');
  assert.ok(newFile.hasOwnProperty('global'), 'Object should have global property');
  assert.ok(newFile.hasOwnProperty('path'), 'Object should have path property');
  assert.ok(newFile.hasOwnProperty('name'), 'Object should have name property');
  assert.end();
});

test('FileData.fileDataFactory should validate config and options should override defaults', function (assert) {
  var newFile = FileData.fileDataFactory();
  assert.ok(newFile instanceof Error, 'Empty options should return error object');
  newFile = FileData.fileDataFactory({
    creator: 'user'
  });
  assert.ok(newFile instanceof Error, 'Options missing description should return error object');
  newFile = FileData.fileDataFactory({
    description: 'description'
  });
  assert.ok(newFile instanceof Error, 'Options missing creator should return error object');
  newFile = FileData.fileDataFactory({
    creator: 'user',
    description: 'A new file'
  });
  assert.ok(newFile instanceof Error, 'Options missing name should return error object');
  newFile = FileData.fileDataFactory({
    creator: 'user',
    description: 'A new file',
    name: 'big-file.txt'
  });
  assert.equal(newFile.path, '', 'Defaults should work');
  assert.equal(newFile.global, false, 'Defaults should work');
  assert.equal(newFile.creator, 'user', 'Required options should work');
  assert.equal(newFile.description, 'A new file', 'Required options should work');
  newFile = FileData.fileDataFactory({
    creator: 'user',
    description: 'A new file',
    name: 'big-file.txt',
    global: true
  });
  assert.equal(newFile.global, true, 'Options should override defaults');
  newFile = FileData.fileDataFactory({
    creator: 'user',
    description: 'A new file',
    name: 'big-file.txt',
    global: 'fred'
  });
  assert.ok(newFile instanceof Error, 'global option must be boolean');
  assert.end();
});

test('FileData save should save file contents and key', function (assert) {
  var newFile = FileData.fileDataFactory(fileMeta1);
  if (newFile instanceof Error) {
    assert.fail();
  } else {
    newFile.save(contents1)
    .then(function (reply) {
      var content = client.get(keyGen.fileKey(newFile));
      assert.equal(content, contents1, 'Saved content equals expected.');
      assert.deepEqual(client.hgetall(keyGen.fileMetaKey(newFile)), newFile.getFileMetadata(), 'Saved metadata equals expected');
      assert.ok(client.zrank(keyGen.fileSetKey(), keyGen.fileKey(newFile)) === 0, 'Key to file saved in set of keys');
      assert.end();
    }).catch(function (err) {
      logger.debug(err);
    });
  }

});

test('FileData content should handle stream', function (assert) {
  var source = stream.PassThrough();
  var newFile = FileData.fileDataFactory(fileMeta1);
  var newWriter = FileData.writer(newFile);
  // writer emits 'filesave' event when the data has been saved
  // So set a listener on it
  newWriter.on('filesave', function () {
    var content = client.get(keyGen.fileKey(newFile));
    assert.equal(content, 'first part, second part', 'Stream content should be saved');
    assert.end();
  });
  source.pipe(newWriter);
  source.write('first part, ');
  source.write('second part');
  source.end();
});

// test('FileData.getMetaData should return config object from file object', function (assert) {
//   assert.end();
// });
