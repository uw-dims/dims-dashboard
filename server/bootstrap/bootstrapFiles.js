'use strict';

// File: server/bootstrap/bootstrapFiles.js

// Bootstrap initial files on server

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
