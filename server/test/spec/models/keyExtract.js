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

var ticketKey1 = 'ticket:1';
var topicKey1 = 'ticket:1:data:cif-results';

test('models/keyExtract.js: keyExtract should operate on file keys', function (assert) {

  assert.equal(keyExtract.fileName(fileKey1), 'main.txt', 'File name extracted');
  assert.equal(keyExtract.fileName(fileKey2), 'data.txt', 'File name extracted');
  assert.equal(keyExtract.fileName(fileKey3), 'partial.jpg', 'File name extracted');
  assert.ok(keyExtract.isFileGlobal(fileKey1), 'File is in global namespace');
  assert.ok(keyExtract.isFileGlobal(fileKey3), 'File is in global namespace');
  assert.notOk(keyExtract.isFileGlobal(fileKey2), 'File is in user namespace');
  assert.equal(keyExtract.filePath(fileKey1), 'boxes/main.txt', 'Path to file extracted');
  assert.equal(keyExtract.filePath(fileKey2), 'user1/cif/test1/data.txt', 'Path to file extracted');
  assert.equal(keyExtract.filePath(fileKey3), 'boxes/remnants/partial.jpg', 'Path to file extracted');
  assert.equal(keyExtract.fileSubPath(fileKey1), 'boxes/', 'Subpath extracted');
  assert.equal(keyExtract.fileSubPath(fileKey2), 'cif/test1/', 'Subpath extracted');
  assert.equal(keyExtract.fileSubPath(fileKey3), 'boxes/remnants/', 'Subpath extracted');
  assert.end();
});

test('models/keyExtract.js: keyExtract should operate on ticket keys', function (assert) {
  assert.equal(keyExtract.ticketNum(ticketKey1), 1, 'Ticket number extracted from ticket key');
  assert.equal(keyExtract.topicData(topicKey1), 'data:cif-results', 'Topic portion extracted from topic key');
  assert.equal(keyExtract.topicName(topicKey1), 'cif-results', 'Topic name extracted from topic key');
  assert.equal(keyExtract.ticketType(topicKey1), 'data', 'Topic/ticket type extracted from topic key');
  assert.equal(keyExtract.tickeKey(topicKey1), 'ticket:1', 'Ticket key extracted from topic key');
  assert.end();
});
