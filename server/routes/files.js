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

var fs = require('fs');
var util = require('util');
var config = require('../config/config');
var yaml = require('js-yaml');
var multiparty = require('multiparty');
var logger = require('../utils/logger')(module);

module.exports = function () {
  var files = {};

  var _deleteFiles = function (files) {
    for (var f in files) {
      logger.debug('files._deleteFiles: Path to delete: ' + files[f][0].path);
      fs.unlink(files[f][0].path, function (err) {
        if (err) {
          logger.error('files._deleteFiles: fs.unlink error for path: ' + files[f][0].path + ', error: ' + err);
        }
      });
    }
  };

  files.upload = function (req, res) {

    logger.debug('routes/files.js upload: dirname is ' + __dirname);

    var filename,
        tempPath,
        data = {},
        extensionAllowed = ['.txt', '.json', '.log', '.yml', '.xml'],
        maxSizeOfFile = config.maxUploadFileSize,
        myDirectory = config.userDataPath,
        targetPath = config.uploadPath,
        // Limit directories to user directories
        directoryMapping = {
          'ip_lists': config.directoryMapping.ip_lists,
          'map_files': config.directoryMapping.map_files,
          'data_files': config.directoryMapping.data_files
        },
        form = new multiparty.Form();

    logger.debug('Initial myDirectory: ' + myDirectory);
    logger.debug('Initial targetPath: ' + targetPath);

    var oc = function (a) {
      var o = {};
      for (var i = 0; i < a.length; i++) {
        o[a[i]] = '';
      }
      return o;
    };

    var getFileExtension = function (name) {
      var i = name.lastIndexOf('.');
      return (i < 0) ? '' : name.substr(i);
    };

    form.parse(req, function (err, fields, files) {
        logger.debug('files.upload form.parse - input fields: ', util.inspect(fields));
        logger.debug('files.upload form.parse - input files: ', util.inspect(files));
        var targetFilename;

        if (err) {
          logger.error('files.upload form.parse - Error parsing request: ' + err.message);
          data.msg = 'Invalid request: ' + err.message;
          return res.status(400).send(data);
        }

        if ('file' in files) {
          var file = files.file[0];
          filename = file.originalFilename;
          if ('newName' in fields) {
            targetFilename = fields.newName[0];
          } else {
            targetFilename = filename;
          }
          tempPath = file.path;
          targetPath = targetPath + targetFilename;

          logger.debug('files.upload form.parse - tempPath: ' + tempPath);
          logger.debug('files.upload form.parse - filename: ' + filename);
          logger.debug('files.upload form.parse - targetFilename: ' + targetFilename);
          logger.debug('files.upload form.parse - targetPath: ' + targetPath);

          // Check for valid extension and size
          if ((getFileExtension(filename) in oc(extensionAllowed)) && (getFileExtension(targetFilename) in oc(extensionAllowed)) && (file.size  < maxSizeOfFile)) {
            logger.debug('files.upload form.parse - File passed validation');

            if ('destination' in fields) {
              for (var key in config.directoryMapping) {
                if (key === fields.destination[0]) {
                  targetPath = myDirectory + config.directoryMapping[key] + targetFilename;
                }
              }
            }

            logger.debug('files.upload form.parse - now targetPath: ' + targetPath);
            fs.rename(tempPath, targetPath, function (err) {
              if (err) {
                logger.error('files.upload form.parse - Error renaming file: ', err);
                _deleteFiles(files);
                data.msg = 'Bad destination directory specified.';
                return res.status(400).send(data);
              }
              data.msg = 'File uploaded sucessfully';
              data.path = fields.destination[0];
              data.filename = targetFilename;
              res.status(200).send(data);
            });

          } else {
            logger.error('files.upload form.parse - File not validated. Size: ' + file.size + ', Extension: ' + getFileExtension(filename));
            _deleteFiles(files);
            data.msg = 'File upload failed. File extension not allowed and/or size is greater than ' + maxSizeOfFile + ' kbytes';
            data.path = '';
            res.status(400).send(data);
          }

        } else {
          logger.error('files.upload form.parse - No file found in upload');
          data.msg = 'No file found in upload';
          res.status(400).send(data);
        }

      });

    return;
  };

  files.files = function (req, res) {

    var directory = -1;
    // Get the directory requested
    if (req.query.source !== null && req.query.source !== undefined) {
      for (var key in config.directoryMapping) {
        if (key === req.query.source) {
          directory = config.directoryMapping[key];
        }
      }
      // Not in user data directories, check default data directory
      if (directory === -1) {
        for (key in config.defaultMapping) {
          if (key === req.query.source) {
            directory = config.defaultMapping[key];
          }
        }
      }
    }

    if (directory === -1) {
      // bad input
      return res.status(400).send('Bad source directory specified.');
    }

    // Request: read a file
    if (req.query.action === 'read') {
      directory = directory + req.query.file;
      fs.exists(directory, function (exists) {
        if (exists) {
          if (req.query.truncate) {
            fs.stat(directory, function (err, stats) {
              if (err) {
                logger.error('fs.stat error', err);
                return res.status(500).send(err);
              }
              fs.open(directory, 'r', function (err, fd) {
                if (err) {
                  logger.error('fs.open error', err);
                  return res.status(500).send(err);
                }
                // Limit size since large files slow down page response and entire
                // content is not needed for this function
                var size = parseInt(req.query.truncate);
                var buf = new Buffer((stats.size > size) ? size : stats.size);
                fs.read(fd, buf, 0, buf.length, null, function (err, bytesRead, buffer) {
                  if (err) {
                    fs.close(fd, function (err) {
                      if (err) {
                        logger.error('Error closing file: ' + err);
                      }
                    });
                    return res.status(500).send(err);
                  }
                  fs.close(fd, function (err) {
                    if (err) {
                      logger.error('Error closing file: ' + err);
                    }
                  });
                  return res.status(200).send(buffer.toString());
                });
              });
            });

          } else {
            fs.readFile(directory, 'utf8', function (err, data) {
              if (err) {
                logger.error('fs.readFile error', err);
                return res.status(500).send(err);
              }
              return res.status(200).send(data);
            });

          }

        } else {
          logger.warn('files: ' + directory + ' does not exist');
          //return res.send(400, 'File does not exist');
          return res.status(400).send('File does not exist');
        }
      });


      // Request: Get directory listing
      // Data object returned:
      // {
      //    files: [
      //    {
      //      name: name of file
      //      type: string file type (rwfind, cif, etc)
      //      desc: description of file
      //    },
      //    path: absolute path to directory containing files
      // }
      //
    } else {
      fs.readFile(directory + 'index.yml', 'utf8', function (err, content) {
        // Setup return data
        var data = {};
        data.path = directory;
        // If error, means that index.yml does not exist
        // Just read the directory and return file names and directory name
        if (err) {
          fs.readdir(directory, function (err, files) {
            if (err) {
              logger.error('fs.readdir error');
              logger.error(err);
              // return res.send(500, err);
              return res.status(500).send(err);

            }
            var len = files.length;
            data.files = [];
            var k = 0;
            for (var i = 0; i < len; i++) {
              if (files[i].indexOf('.') !== 0) {
                data.files[k] = { name: files[i], type: null, desc: null };
                k++;
              }
            }
            return res.status(200).send(data);
          });

        } else {
          // Use yaml file for file contents
          try {
            data.files = yaml.safeLoad(content);
            //return res.send(200,data);
            return res.status(200).send(data);
          } catch (e) {
            logger.error(e);
            //return res.send(500,e);
            return res.status(500).send(e);
          }
        }
      });

    }
  };

  return files;

};
