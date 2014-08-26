
var fs = require('fs');
var util = require('util');
var config = require('../config');
var yaml = require('js-yaml');
var multiparty = require('multiparty');

exports._deleteFiles = function(files) {
    for (var f in files) {
        console.log('DEBUG: In deleteFiles, path is ' + files[f][0].path);
        fs.unlink(files[f][0].path, function(err) {
            if (err) { 
                console.log('fs.unlink error: Path: '+ files[f][0].path +', error: ' + err);
            }
        });
    }
}


exports.upload = function(req, res){
    var filename, 
        tmp_path,
        data = {},
        extensionAllowed = [".txt", ".json"],
        maxSizeOfFile = 2000,
        myDirectory = './mydata/',
        target_path = './upload/',
        directoryMapping = {
            'ip_lists': 'ipFiles/',
            'map_files': 'mapFiles/',
            'data_files': 'dataFiles/'
        },
        form = new multiparty.Form();

    var oc = function (a){
        var o = {};
        for(var i=0;i<a.length;i++) {
            o[a[i]]='';
        }
        return o; 
    };

    var getFileExtension = function(name) {
        var i = name.lastIndexOf('.');
        return  (i < 0) ? '' : name.substr(i);  
    }

    form.parse(req, function(err, fields, files) {
       console.log(util.inspect(fields));
       console.log(util.inspect(files));
        if (err) {
            console.log('error on parse');
            data.msg = 'Invalid request: '+ err.message;
            return res.status(400).send(data); 
        }
        
        if ('file' in files) {
            var file = files['file'][0];
            filename = file.originalFilename;
            if ('newName' in fields) {
                targetFilename = fields['newName'][0];
            } else {
                targetFilename = filename;
            }
            tmp_path = file.path;
            target_path = target_path + targetFilename;
            console.log('DEBUG: Current temp path is ' + tmp_path);
            console.log('filename is ' + filename);
            console.log('targetFilename is ' + targetFilename);
            console.log('target_path is ' + target_path);

            // Check for valid extension and size
            if((getFileExtension(filename) in oc(extensionAllowed)) && (getFileExtension(targetFilename) in oc(extensionAllowed)) && ((file.size /1024 ) < maxSizeOfFile)) { 
                console.log ('File passed validation');

                if ('destination' in fields) {
                    for (key in directoryMapping) {
                        if (key == fields['destination'][0]) {
                            target_path = myDirectory + directoryMapping[key] + targetFilename;
                        }
                    }
                }
                
                fs.rename(tmp_path, target_path, function(err) {
                    if (err) {
                        exports._deleteFiles(files);
                        console.log('fs.rename error: ' + err);
                        data.msg = 'Bad destination directory specified.';
                        return res.status(400).send(data); 
                    }
                    data.msg = "File uploaded sucessfully";
                    data.path = target_path;
                    res.status(200).send(data);
                });

            } else {
                console.log('Wrong file extension');
                exports._deleteFiles(files);
                data.msg = "File upload failed. File extension not allowed and/or size is greater than "+maxSizeOfFile + ' kbytes';
                data.path = "";
                res.status(400).send(data);
            }

        } else {
            data.msg = 'No file found in upload';
            res.status(400).send(data);
        }

    });



    // var count = 0;
    // form.on('error', function(err) {
    //     console.log('Error parsing form: ' + err.stack);
    // });

    // form.on('part', function (part) {
    //     if (part.filename === null || part.filename === undefined) {
    //         console.log('got field named ' + part.name);
    //         console.log(part);
    //         part.resume();
    //     } else {
    //         count++;
    //         console.log('got file named ' + part.name);
    //         console.log(part);

    //         part.resume();
    //     }

    // });

    // form.on('close', function() {
    //     console.log('upload complete');
    //     res.writeHead(200, {'content-type': 'text/plain'});
    //     res.end ('Received ' + count + ' files');
    // });

    // form.parse(req);

    return;

    // filename = (util.inspect(fields).destination !== "" && util.inspect(fields).newName !== undefined) ? util.inspect(fields).newName : req.files.file.name;
    // i = filename.lastIndexOf('.');
    // file_extension = (i < 0) ? '' : filename.substr(i);      
    // tmp_path = req.files.file.path;

    // Get target path
    // if (req.body.destination !== null && req.body.destination !== undefined) {
    //     for (key in directoryMapping) {
    //         if (key == req.body.destination) {
    //             target_path = myDirectory + directoryMapping[key] + filename;
    //         }
    //     }
    // }

    // console.log("target_path: " + target_path);
    // console.log("filename: " + filename);

    // if((file_extension in oc(extensionAllowed)) && ((req.files.file.size /1024 ) < maxSizeOfFile)) { 
        
    //     console.log("file passed validation");
    //     fs.rename(tmp_path, target_path, function(err) {
    //         if (err) {
    //             console.log('fs.rename error: ' + err);
    //             return res.status(400).send('Bad destination directory specified.'); 
    //         }
    //         // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files 
    //         fs.unlink(tmp_path, function() {
    //             if (err) { 
    //             console.log('fs.unlinke error: ' + err);
    //             return res.status(500).send(err);
    //             }
    //         });
    //     });
    //     data.msg = "File uploaded sucessfully";
    //     data.path = target_path;
    //     console.log("data sent back is");
    //     console.log(data);

    // }  else{
    // // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files 
    //     fs.unlink(tmp_path, function(err) {
    //         if (err) { 
    //             console.log('fs.unlinke error: ' + err);
    //             return res.status(500).send(err);
    //         }
    //     });
    //     data.msg = "File upload failed. File extension not allowed and size must be less than "+maxSizeOfFile;
    //     data.path = "";
    //     console.log(data)
    //     res.status(400).send(data);
    //     // return res.send(200, "File upload failed.File extension not allowed and size must be less than "+maxSizeOfFile);
    // }
    // return res.status(200).send(data);
};



/**
 * 
 */
exports.files = function(req,res) {
    
    var directory = -1;
    // Get the directory requested
    if (req.query.source !== null && req.query.source !== undefined) {
        for (key in config.directoryMapping) {
            if (key == req.query.source) {
                directory = config.directoryMapping[key];
            }
        }
        // Not in user data directories, check default data directory
        if (directory == -1) {
            for (key in config.defaultMapping) {
                if (key == req.query.source) {
                    directory = config.defaultMapping[key];
                }
            }
        }
    }

    if (directory == -1) {
        // bad input
        return res.status(400).send('Bad source directory specified.');
    } 

    // Request: read a file
    if (req.query.action == 'read') {
        directory = directory + req.query.file;
        fs.exists(directory, function(exists) {
            if (exists) {
                if (req.query.truncate) {
                    fs.stat(directory, function(err, stats) {
                        if (err) {
                            console.log('fs.stat error');
                            console.log(err);
                            return res.status(500).send(err);
                        } 
                        fs.open(directory, 'r', function(err, fd) {
                            if (err) {
                                console.log('fs.open error', err);
                                return res.status(500).send(err);
                            } 
                            // Limit size since large files slow down page response and entire
                            // content is not needed for this function
                            var size = parseInt(req.query.truncate);
                            var buf = new Buffer((stats.size > size) ? size : stats.size);
                            fs.read(fd, buf, 0, buf.length, null, function(err, bytesRead, buffer) {
                                if (err) {
                                    console.log('fs.read error', err);
                                    fs.close(fd, function(err) {
                                        if (err) {
                                          console.log("Error closing file: " + err);
                                        }
                                    });
                                    return res.status(500).send(err);
                                }
                                console.log('File read: ' + directory);
                                fs.close(fd, function(err) {
                                    if (err) {
                                      console.log("Error closing file: " + err);
                                    }
                                });
                                return res.status(200).send(buffer.toString());
                            });
                        });
                    });

                } else {
                    fs.readFile(directory, 'utf8', function(err, data) {
                        if (err) {
                            console.log('fs.readFile error', err);
                            return res.status(500).send(err);
                        } 
                        return res.status(200).send(data);
                    });

                }
                
            } else {
                console.log(directory+' does not exist');
                //return res.send(400, 'File does not exist');
                return res.status(400).send('File does not exist');
            }
        });


    // Request: Get directory listing
    } else {
        fs.readFile(directory+'index.yml', 'utf8', function(err, content) {
            // Setup return data
            var data = {};
            data.path = directory;
            // If error, means that index.yml does not exist
            // Just read the directory and return file names and directory name
            if (err) {
                fs.readdir(directory, function(err, files) {
                    if (err) {
                        console.log('fs.readdir error');
                        console.log(err);
                       // return res.send(500, err);
                       return res.status(500).send(err);

                    }
                    var len = files.length;
                    data.result = [];
                    var k = 0;
                    for (var i=0; i<len; i++) {
                        if (files[i].indexOf('.') !== 0) {
                            data.result[k] = { name: files[i], type: null, desc: null }
                            k++;
                        }
                    }    
                    //return res.send(200, data);
                    return res.status(200).send(data);
                });

            } else {
                // Use yaml file for file contents
                try {                
                    data.result = yaml.safeLoad(content);
                    //return res.send(200,data);
                    return res.status(200).send(data);
                } catch (e) {
                    console.log(e);
                    //return res.send(500,e);
                    return res.status(500).send(e);
                }              
            }
        })
        
    }
};
