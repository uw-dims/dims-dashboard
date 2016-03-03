/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
'use strict';

var test = require('tape-catch');
var stream = require('stream');
var _ = require('lodash-compat');
var fs = require('fs');
var path = require('path');

process.env.NODE_ENV = 'test';

// ROOT_DIR is path to server directory
var ROOT_DIR = __dirname + '/../../../';
// console.log('dirname is ', __dirname);
// console.log('ROOT_DIR is ', ROOT_DIR);
// console.log('Current directory: ' + process.cwd());

var keyGen = require('../../../models/keyGen');

// Enable service discovery for this test
var diContainer = require('../../../services/diContainer')();
var redis = require('redis');

var client = redis.createClient();
// Add the regular proxy to diContainer
client.select(10, function (err, reply) {
  if (err) {
    console.error('test: redis client received error when selecting database ', err);
  } else {
    console.log('test: redis has selected db', 10, 'reply is ', reply);
    client.flushdb();
  }
});
/* istanbul ignore next */
diContainer.factory('db', require('../../../utils/redisProxy'));

diContainer.register('client', client);

diContainer.factory('FileData', require('../../../models/fileData'));
var FileData = diContainer.get('FileData');
var db = diContainer.get('db');

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
    description: 'description1',
    path: 'boxes' + pathCounter + '/main.txt',
    global: true
  };
};
var fileMeta2 = function (pathCounter) {
  return {
    creator: user2,
    description: 'description2',
    path: 'boxes/stores' + pathCounter + '/main.txt',
    global: false
  };
};

test('models/fileData.js: FileData.fileDataFactory should return file object', function (assert) {
  setTimeout(function () {
    var newFile = FileData.fileDataFactory(fileMeta1(pathCounter));
    assert.equal(typeof (newFile.save), 'function', 'Object should have save function');
    assert.equal(typeof (newFile.create), 'function', 'Object should have create function');
    assert.equal(typeof (newFile.getConfig), 'function', 'Object should have getMetaData function');
    assert.ok(newFile.hasOwnProperty('creator'), 'Object should have creator property');
    assert.ok(newFile.hasOwnProperty('description'), 'Object should have description property');
    assert.ok(newFile.hasOwnProperty('global'), 'Object should have global property');
    assert.ok(newFile.hasOwnProperty('path'), 'Object should have path property');
    assert.end();
  }, 1000);
});

test('models/fileData.js: FileData.fileDataFactory should validate config and options should override defaults', function (assert) {
  var newFile = FileData.fileDataFactory();
  assert.ok(newFile instanceof Error, 'Empty options should return error object');
  newFile = FileData.fileDataFactory({
    creator: 'user'
  });
  assert.ok(newFile instanceof Error, 'Options with only creator return error object');
  newFile = FileData.fileDataFactory({
    description: 'path'
  });
  assert.ok(newFile instanceof Error, 'Options with only path should return error object');
  newFile = FileData.fileDataFactory({
    creator: 'user',
    description: 'A new file'
  });
  assert.ok(newFile instanceof Error, 'Options missing name should return error object');
  newFile = FileData.fileDataFactory({
    creator: 'user',
    description: 'A new file',
    path: 'big-file.txt'
  });
  assert.equal(newFile.path, 'big-file.txt', 'Required options should work');
  assert.equal(newFile.global, false, 'Defaults should work');
  assert.equal(newFile.creator, 'user', 'Required options should work');
  assert.equal(newFile.description, 'A new file', 'Options should work');
  newFile = FileData.fileDataFactory({
    creator: 'user',
    description: 'A new file',
    path: 'big-file.txt',
    global: true
  });
  assert.equal(newFile.global, true, 'Options should override defaults');
  newFile = FileData.fileDataFactory({
    creator: 'user',
    description: 'A new file',
    path: 'big-file.txt',
    global: 'fred'
  });
  assert.ok(newFile instanceof Error, 'global option must be boolean');
  assert.end();
});

test('models/fileData.js: FileData create should save file contents and key', function (assert) {

  var newFile = FileData.fileDataFactory(fileMeta1(pathCounter));

  if (newFile instanceof Error) {
    assert.fail();
  } else {
    return newFile.create(contents1)
    .then(function (reply) {
      console.log('TEST filedata create newFile config is ', newFile.getConfig());
      console.log('TEST filedata create reply is ', reply);
      return db.getProxy(keyGen.fileKey(newFile));
    })
    .then(function (reply) {
      assert.equal(reply, contents1, 'Saved content equals expected.');
      return db.hgetallProxy(keyGen.fileMetaKey(newFile));
    })
    .then(function (reply) {
      console.log('TEST filedata create metadata reply is ', reply);
      // Convert strings
      var result = reply;
      result.createdTime = _.parseInt(reply.createdTime);
      result.modifiedTime = _.parseInt(reply.modifiedTime);
      result.global = reply.global === 'true' ? true : false;
      assert.deepEqual(reply, newFile.getConfig(), 'Saved metadata equals expected');
      return db.zrankProxy(keyGen.fileSetKey(newFile), keyGen.fileKey(newFile));
    })
    .then(function (reply) {
      console.log('TEST filedata: create reply from zrank', reply);
      assert.ok(reply === 0, 'Key to file saved in set of keys');
      assert.end();
    }).catch(function (err) {
      console.log(err);
      assert.end();
    });
  }

});

test('models/fileData.js: FileData.getContent should return content from the database', function (assert) {
  pathCounter++;
  var newFile = FileData.fileDataFactory(fileMeta2(pathCounter));
  return newFile.create(contents2)
  .then(function (reply) {
    return newFile.getContent();
  })
  .then(function (reply) {
    assert.equal(reply, contents2, 'getContents returned contents from database');
    assert.end();
  })
  .catch(function (err) {
    console.error(err);
    assert.end();
  });
});

test('models/fileData.js: Filedata.exists should return true if the key exists in the database', function (assert) {
  pathCounter++;
  var newFile = FileData.fileDataFactory(fileMeta2(pathCounter));
  return newFile.create(contents2)
  .then(function (reply) {
    return newFile.exists();
  })
  .then(function (reply) {
    assert.ok(reply, 'Saved key exists in database');
    pathCounter++;
    var newFile2 = FileData.fileDataFactory(fileMeta2(pathCounter));
    return newFile2.exists();
  })
  .then(function (reply) {
    console.log('TEST reply to exists = false ', reply);
    assert.notOk(reply, 'Unsaved key was not found in database');
    assert.end();
  })
  .catch(function (err) {
    console.error(err);
    assert.end();
  });
});

test('models/fileData.js: FileData.getConfig should return the config object', function (assert) {
  pathCounter++;
  var newFile = FileData.fileDataFactory(fileMeta2(pathCounter));
  var config = newFile.getConfig();
  var expected = fileMeta2(pathCounter);
  assert.deepEqual(config, expected, 'Unsaved file config returned successfully');
  return newFile.create(contents2)
  .then(function (reply) {
    config = newFile.getConfig();
    expected.createdTime = newFile.createdTime;
    expected.modifiedTime = newFile.modifiedTime;
    assert.deepEqual(config, expected, 'Saved file config returned successfully');
    assert.end();
  })
  .catch(function (err) {
    console.error(err);
    assert.end();
  });
});

test('models/fileData.js: FileData.getMetadata should return metadata from database', function (assert) {
  pathCounter++;
  var newFile = FileData.fileDataFactory(fileMeta2(pathCounter));
  return newFile.create(contents2)
  .then(function (reply) {
    // Get the metaData from the database
    console.log('TEST getMetadata reply from create is ', reply);
    return newFile.getMetadata();
  })
  .then(function (reply) {
    console.log('TEST getMetadata reply from getMetadata is ', reply);
    assert.deepEqual(reply, newFile.getConfig(), 'Saved file config returned successfully');
    assert.end();
  })
  .catch(function (err) {
    console.error(err);
    assert.end();
  });
});

test('models/fileData.js: FileData content should handle stream', function (assert) {
  pathCounter++;
  var source = stream.PassThrough();
  var newFile = FileData.fileDataFactory(fileMeta1(pathCounter));
  var newWriter = FileData.writer(newFile, 'create');
  // writer emits 'filesave' event when the data has been saved
  // So set a listener on it
  newWriter.on('filesave', function () {
    return db.getProxy(keyGen.fileKey(newFile)).then(function (reply) {
      assert.equal(reply, 'first part, second part', 'Stream content should be saved');
      assert.end();
    })
    .catch(function (err) {
      console.error(err);
      assert.end();
    });
  });
  source.pipe(newWriter);
  source.write('first part, ');
  source.write('second part');
  source.end();
});

test('models/fileData.js: FileData should handle content from file via stream', function (assert) {
  pathCounter++;
  var newFile = FileData.fileDataFactory(fileMeta1(pathCounter));
  var testFilePath = path.join(ROOT_DIR, '/tests/testData/response.json');
  var testFile = fs.readFileSync(testFilePath);
  var newWriter = FileData.writer(newFile, 'create');
  newWriter.on('filesave', function () {
    return db.getProxy(keyGen.fileKey(newFile)).then(function (reply) {
      assert.deepEqual(reply, testFile.toString(), 'Stream content should be saved');
      assert.end();
    })
    .catch(function (err) {
      console.error(err);
      assert.end();
    });
  });
  fs.createReadStream(testFilePath).pipe(newWriter);
});

test('models/fileData.js: Finished', function (assert) {
  console.log('Quitting redis');
  client.flushdb(function (reply) {
    console.log('flushdb reply ', reply);
    client.quit(function (err, reply) {
      console.log('quit reply ', reply);
      assert.end();
    });
  });
});

