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

// File: server/bootstrap/bootstrapFiles.js

// Bootstrap initial files on server for demonstration purposes

var fs = require('fs');
var path = require('path');
var _ = require('lodash-compat');
var config = require('../config/config');

var ROOT_DIR = __dirname + '/../../';

(function () {

  var bootstrapFiles = {};
  var copyConfig = {};

  copyConfig[path.join(ROOT_DIR, 'initial_data/mydata/dataFiles')] = config.directoryMapping.data_files;
  copyConfig[path.join(ROOT_DIR, 'initial_data/mydata/ipFiles')] = config.directoryMapping.ip_lists;
  copyConfig[path.join(ROOT_DIR, 'initial_data/mydata/mapFiles')] = config.directoryMapping.map_files;

  exports.runBootstrap = bootstrapFiles.runBootstrap = function (type) {

    if (type !== 'add' && type !== 'remove') {
      console.error('[+++] argument must be add or remove. Exiting...');
      return;
    }

    function remove(toDir) {
      fs.readdir(toDir, function (err, files) {
        if (err) {
          console.error('Directory ', toDir, ' list error: ', err);
          return;
        }
        files.forEach(function (file, index) {
          var toPath = path.join(toDir, file);
          fs.unlink(toPath, function (err) {
            if (err) {
              console.log('[+++] Failed to remove %s', toPath, err.toString());
            } else {
              console.log('[+++] Removed %s ', toPath);
            }
          });
        });
      });
    }

    function move(fromDir, toDir) {
      fs.readdir(fromDir, function (err, files) {
        if (err) {
          console.error('Directory ', fromDir, ' list error: ', err);
          return;
        }
        files.forEach(function (file, index) {
          var fromPath = path.join(fromDir, file);
          var toPath = path.join(toDir, file);
          console.log('[+++] Copying %s to %s ', fromPath, toPath);
          fs.stat(fromPath, function (err, stat) {
            if (err) {
              console.error('Could not stat file ', fromPath, ' ', err);
              return;
            }
            fs.createReadStream(fromPath).pipe(fs.createWriteStream(toPath));
          });
        });
      });
    }

    if (type === 'add') {
      _.forEach(copyConfig, function (to, from) {
        console.log('from is %s, to is %s ', from, to);
        move(from, to);
      });
    } else if (type === 'remove') {
      _.forEach(copyConfig, function (to, from) {
        remove(to);
      });
    }
  };

  if (!module.parent) {
    bootstrapFiles.runBootstrap(process.argv[2]);
  }

})();
