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

// Settings routes - retrieve and update settings via REST api for the logged in user

var logger = require('../utils/logger')(module);
// var UserSettings = require('../models/userSettings')

module.exports = function (UserSettings) {
  var settings = {};

  settings.get = function (req, res) {
    // id is from logged in user
    var id = req.user.username;
    logger.debug('routes/settings get: id = ', id);
    // Create new UserSettings object
    var userSettings = UserSettings.userSettingsFactory(id);
    logger.debug('routes/settings get: new object = ', userSettings);
    // Get saved settings for this user
    return userSettings.retrieveSettings()
    .then(function (data) {
      logger.debug('routes/settings.get  settings: ', data);
      res.status(200).send({data: data});
    }).then(function (err) {
      return res.status(400).send(err);
    });
  };

  settings.update = function (req, res) {
    var id = req.user.username;

    var userSettings = UserSettings.userSettingsFactory(id, req.body.settings);
    userSettings.saveSettings()
    .then(function (data) {
      logger.debug('routes/settings.set settings: ', data);
      res.status(200).send({data: data});
    }).then(function (err) {
      return res.status(400).send(err);
    });
  };
  return settings;
};

