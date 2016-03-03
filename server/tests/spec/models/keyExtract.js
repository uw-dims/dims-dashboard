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
var _ = require('lodash-compat');
var logger = require('../../../utils/logger')(module);
var keyExtract = require('../../../models/keyExtract');
var c = require('../../../config/redisScheme');

// Test Data
var fileKey1 = 'dims:file:_global:boxes:main.txt';
var fileKey2 = 'dims:file:user1:cif:test1:data.txt';
var fileKey3 = 'dims:file:_global:boxes:remnants:partial.jpg';

var ticketKey1 = 'dims:ticket:1';
var topicKey1 = 'dims:ticket:1:analysis:cif-results';

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
  assert.equal(keyExtract.topicData(topicKey1), 'analysis:cif-results', 'Topic portion extracted from topic key');
  assert.equal(keyExtract.topicName(topicKey1), 'cif-results', 'Topic name extracted from topic key');
  assert.equal(keyExtract.ticketType(topicKey1), 'analysis', 'ticket type extracted from topic key');
  assert.equal(keyExtract.ticketKey(topicKey1), 'dims:ticket:1', 'Ticket key extracted from topic key');
  assert.end();
});
