'use_strict';

var test = require('tape-catch');
var _ = require('lodash-compat');
var logger = require('../../../utils/logger');
var keyExtract = require('../../../models/keyExtract');
var c = require('../../../config/redisScheme');

// Test Data
var fileKey1 = 'file:global:boxes:main.txt';
var fileKey2 = 'file:user1:cif:test1:data.txt';
var fileKey3 = 'file:global:boxes:remnants:partial.jpg';

test('models/keyExtract.js: keyExtract should operate on file keys', function (assert) {

  assert.equal(keyExtract.fileName(fileKey1), 'main.txt');
  assert.equal(keyExtract.fileName(fileKey2), 'data.txt');
  assert.equal(keyExtract.fileName(fileKey3), 'partial.jpg');
  assert.ok(keyExtract.isFileGlobal(fileKey1));
  assert.ok(keyExtract.isFileGlobal(fileKey3));
  assert.notOk(keyExtract.isFileGlobal(fileKey2));
  assert.equal(keyExtract.filePath(fileKey1), 'boxes/main.txt');
  assert.equal(keyExtract.filePath(fileKey2), 'user1/cif/test1/data.txt');
  assert.equal(keyExtract.filePath(fileKey3), 'boxes/remnants/partial.jpg');
  assert.equal(keyExtract.fileSubPath(fileKey1), 'boxes/');
  assert.equal(keyExtract.fileSubPath(fileKey2), 'cif/test1/');
  assert.equal(keyExtract.fileSubPath(fileKey3), 'boxes/remnants/');
  assert.end();
});
