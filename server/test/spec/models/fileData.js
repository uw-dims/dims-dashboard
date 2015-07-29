'use strict'

var test = require('tape-catch');

var _ = require('lodash-compat');
var stream = require('stream');

var logger = require('../../../utils/logger');

var client = require('redis').createClient();
client.select(10, function (err, reply) {
  if (err) {
    logger.error('test: redis client received error when selecting database ', err);
  } else {
    logger.debug('test: redis has selected db', 10, 'reply is ', reply);
  }
});

var keyGen = require('../../../models/keyGen');
var extract = require('../../../models/keyExtract');

// var client = require('../redisClient');

// Setup service discovery for this test
var diContainer = require('../../../services/diContainer')();
diContainer.factory('db', require('../../../utils/redisProxy'));
diContainer.factory('FileData', require('../../../models/fileData'));
diContainer.register('client', client);
var FileData = diContainer.get('FileData');
var db = diContainer.get('db');

// var svcLoc = require('../../../utils/serviceLocator')();
// svcLoc.factory('FileData', require('../../../models/fileData'));
// svcLoc.factory('db', require('../../../utils/redisUtils'));
// svcLoc.register('client', client);

// var FileData = svcLoc.get('FileData');

// Bootstrap some data
// Use pathCounter so we will get a different key for each test run
var pathCounter = 0;
var user1 = 'testUser1'; // Simulates logged in user
var user2 = 'testUser2';
var contents1 = 'Contents1';
var contents2 = 'Contents2';
var fileMeta1 = function (pathCounter) {
  return {
    creator: user1,
    description: 'description',
    path: 'boxes' + pathCounter,
    global: true,
    name: 'main.txt'
  };
};
var fileMeta2 = function (pathCounter) {
  return {
    creator: 'user2',
    description: 'description',
    path: 'boxes/stores' + pathCounter,
    global: false,
    name: 'main.txt'
  }
};

test('models/fileData.js: FileData.fileDataFactory should return file object', function (assert) {
  var newFile = FileData.fileDataFactory(fileMeta1(pathCounter));
  assert.equal(typeof (newFile.save), 'function', 'Object should have save function');
  assert.equal(typeof (newFile.getConfig), 'function', 'Object should have getMetaData function');
  assert.ok(newFile.hasOwnProperty('creator'), 'Object should have creator property');
  assert.ok(newFile.hasOwnProperty('description'), 'Object should have description property');
  assert.ok(newFile.hasOwnProperty('global'), 'Object should have global property');
  assert.ok(newFile.hasOwnProperty('path'), 'Object should have path property');
  assert.ok(newFile.hasOwnProperty('name'), 'Object should have name property');
  assert.end();
});

test('models/fileData.js: FileData.fileDataFactory should validate config and options should override defaults', function (assert) {
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

test('models/fileData.js: FileData save should save file contents and key', function (assert) {

  var newFile = FileData.fileDataFactory(fileMeta1(pathCounter));

  if (newFile instanceof Error) {
    assert.fail();
  } else {
    return newFile.save(contents1)

    .then(function (reply) {
      return db.get(keyGen.fileKey(newFile));
    })
    .then(function (reply) {
      assert.equal(reply, contents1, 'Saved content equals expected.');
      return db.hgetall(keyGen.fileMetaKey(newFile));
    })
    .then(function (reply) {
      // Convert strings
      reply.createdTime = _.parseInt(reply.createdTime);
      reply.modifiedTime = _.parseInt(reply.modifiedTime);
      if (reply.global === 'true') {
        reply.global = true;
      } else {
        reply.global = false;
      }
      assert.deepEqual(reply, newFile.getConfig(), 'Saved metadata equals expected');
      return db.zrank(keyGen.fileSetKey(newFile), keyGen.fileKey(newFile));
    })
    .then(function (reply) {
      assert.ok(reply === 0, 'Key to file saved in set of keys');
      assert.end();
    }).catch(function (err) {
      logger.debug(err);
      assert.end();
    });
  }

});

test('models/fileData.js: FileData.getContent should return content from the database', function (assert) {
  pathCounter++;
  var newFile = FileData.fileDataFactory(fileMeta2(pathCounter));
  return newFile.save(contents2)
  .then(function (reply) {
    return newFile.getContent()
  })
  .then(function (reply) {
    assert.equal(reply, contents2, 'getContents returned contents from database');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
    assert.end();
  });
});

test('models/fileData.js: Filedata.exists should return true if the key exists in the database', function (assert) {
  pathCounter++;
  var newFile = FileData.fileDataFactory(fileMeta2(pathCounter));
  return newFile.save(contents2)
  .then(function (reply) {
    return newFile.exists()
  })
  .then(function (reply) {
    assert.ok(reply, 'Saved key exists in database');
    pathCounter++;
    var newFile2 = FileData.fileDataFactory(fileMeta2(pathCounter));
    return newFile2.exists()
  })
  .then(function (reply) {
    logger.debug('TEST reply to exists = false ', reply);
    assert.notOk(reply, 'Unsaved key was not found in database');
    assert.end();
  })
  .catch(function (err) {
    logger.debug(err);
    assert.end();
  });
});

test('models/fileData.js: FileData.getConfig should return the config object', function (assert) {
  pathCounter++;
  var newFile = FileData.fileDataFactory(fileMeta2(pathCounter));
  var config = newFile.getConfig();
  var expected = fileMeta2(pathCounter)
  assert.deepEqual(config, expected, 'Unsaved file config returned successfully');
  return newFile.save(contents2)
  .then(function (reply) {
    config = newFile.getConfig();
    expected.createdTime = newFile.createdTime;
    expected.modifiedTime = newFile.modifiedTime;
    assert.deepEqual(config, expected, 'Saved file config returned successfully');
    assert.end();
  })
});

test('models/fileData.js: FileData.getMetadata should return metadata from database', function (assert) {
  assert.end();
});

test('models/fileData.js: FileData content should handle stream', function (assert) {
  pathCounter++;
  var source = stream.PassThrough();
  var newFile = FileData.fileDataFactory(fileMeta1(pathCounter));
  var newWriter = FileData.writer(newFile);
  // writer emits 'filesave' event when the data has been saved
  // So set a listener on it
  newWriter.on('filesave', function () {
    return db.get(keyGen.fileKey(newFile)).then(function (reply) {
      assert.equal(reply, 'first part, second part', 'Stream content should be saved');
      assert.end();
    })
    .catch(function (err) {
      logger.debug(err);
      assert.end();
    });
  });
  source.pipe(newWriter);
  source.write('first part, ');
  source.write('second part');
  source.end();
});

test('models/fileData.js: Finished', function (assert) {
  logger.debug('Quitting redis');
  client.flushdb(function (reply) {
    logger.debug('flushdb reply ', reply);
    client.quit(function (err, reply) {
      logger.debug('quit reply ', reply);
      assert.end();
    });
  });
});

