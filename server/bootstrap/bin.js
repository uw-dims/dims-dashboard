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

// Demonstrate how system can bin IPs

var _ = require('lodash-compat');
var moment = require('moment');
var redis = require('redis');
var path = require('path');
var ROOT_DIR = __dirname + '/../';


var keyGen = require(path.join(ROOT_DIR, '/models/keyGen'));

var diContainer = require(path.join(ROOT_DIR, '/services/diContainer'))();
var client = redis.createClient();

diContainer.factory('anonService', require(path.join(ROOT_DIR, '/services/anonymize')));
diContainer.factory('db', require(path.join(ROOT_DIR, '/utils/redisProxy')));
diContainer.register('client', client);
diContainer.factory('Ticket', require(path.join(ROOT_DIR, '/models/ticket')));
diContainer.factory('UserSettings', require(path.join(ROOT_DIR, '/models/userSettings')));
diContainer.factory('mitigationService', require(path.join(ROOT_DIR, '/services/mitigation')));

var mitigationService = diContainer.get('mitigationService');

(function () {
  var bin = {};

  exports.runBin = bin.runBin = function () {

    var ticketKey;
    var ipPath = __dirname + '/mitigation/mitigation_demo_short.txt';

    mitigationService.initiateMitigation(ipPath, 'testuser2')
    .then(function (reply) {
      // will fix this behavior later
      ticketKey = keyGen.ticketKey(reply.parent);
      // console.log(ticketKey);
      client.quit(function (err, reply) {
        console.log('quit reply ', reply);
      });
    })
    .catch(function (err) {
      console.log(err);
      console.log(err.stack);
      client.quit(function (err, reply) {
        console.log('quit reply ', reply);
      });
    })
    .done();
  };

  if (!module.parent) {
    bin.runBin();
  }

})();
