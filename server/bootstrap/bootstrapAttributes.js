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

// File: server/bootstrap/bootstrapAttributes.js

// Bootstrap attributes for test users

var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var _ = require('lodash-compat');
var q = require('q');

var ROOT_DIR = __dirname + '/../';
var diContainer = require(path.join(ROOT_DIR, '/services/diContainer'))();
var bluebird = require('bluebird');
var redis = require('redis');

var client = bluebird.promisifyAll(redis.createClient());
bluebird.promisifyAll(client.multi());

diContainer.factory('Attributes', require(path.join(ROOT_DIR, '/models/attributes')));
diContainer.factory('attributeService', require(path.join(ROOT_DIR, '/services/attributes')));
diContainer.register('client', client);
diContainer.factory('UserModel', require(path.join(ROOT_DIR, '/models/user')));
diContainer.register('Bookshelf', require(path.join(ROOT_DIR, '/utils/bookshelf')));

var Attributes = diContainer.get('Attributes');
var attributeService = diContainer.get('attributeService');
var UserModel = diContainer.get('UserModel');
var Bookshelf = diContainer.get('Bookshelf');

(function () {

  var bootstrapAttributes = {};

  // options is array of initial users who should have initial attributes assigned.
  // Should contain 4 userIds...

  exports.runBootstrap = bootstrapAttributes.runBootstrap = function (options) {
    console.log('input users', options);
    var users = [];
    var yamlPath = path.join(__dirname, './userAttributes.yml');
    var doc;
    try {
      doc = yaml.safeLoad(fs.readFileSync(yamlPath, 'utf8'));
    } catch (err) {
      console.error('Cannot read file at ' + yamlPath + '. Error: ', err);
      return;
    }
    // Get the current users
    return UserModel.Users.forge().fetch()
    .then(function (collection) {
      _.forEach(collection.toJSON(), function (value, key) {
        // If user is in options, then save it
        if (_.includes(options, value.ident)) {
          users.push(value.ident);
        }
      });
      // Now have array of actual usernames
      console.log('bootstrapAttributes: users are ', users);
      var attrPromises = [];
      var i = 0;
      _.forEach(doc, function (config, user) {
        var newConfig = {};
        _.forEach(config, function (value, type) {
          // We don't push the name field to this config
          if (type !== 'name') {
            newConfig[type] = value;
          }
        });
        console.log('bootstrapAttributes. newConfig is ', newConfig);
        // Replace test users - there are 4
        var thisUser = users[i];
        i++;
        var attributes = Attributes.attributesFactory(thisUser);
        attrPromises.push(attributes.updateAttributes(thisUser, newConfig));
      });
      return q.all(attrPromises);
    })
    .then(function () {
      // print the result, save to a new file, and quit redis client
      Attributes.getAllAttributes()
      .then(function (reply) {
        console.log('bootstrapAttributes: returned from Attributes.getAllAttributes(): ', reply);
        return attributeService.attributesToFile();
      })
      .then(function () {
        return client.quitAsync();
      })
      .then(function () {
        Bookshelf.knex.destroy(function (err, reply) {
          console.log(err, reply);
        });
      })
      .catch(function (err) {
        console.log(err);
      })
      .done();
    });
  };


  if (!module.parent) {
    bootstrapAttributes.runBootstrap(process.argv.slice(2));
  }

})();
