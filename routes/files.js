
var fs = require('fs');
var config = require('../config');
var yaml = require('js-yaml');

exports.upload = function(req, res){
    var filename, 
        tmp_path,
        i,
        file_extension,
        extensionAllowed = [".txt", ".json"],
        maxSizeOfFile = 2000,
        myDirectory = './mydata/',
        target_path = './upload/',
        directoryMapping = {
            'ip_lists': 'ipFiles/',
            'map_files': 'mapFiles/',
            'data_files': 'dataFiles/'
        },
        data = {};

    console.log("req.body.fileName " + req.body.fileName);
    console.log("req.files.file.name" + req.files.file.name);
    filename = (req.body.fileName !== null && req.body.fileName !== undefined) ? req.body.fileName : req.files.file.name;
    i = filename.lastIndexOf('.');
    file_extension = (i < 0) ? '' : filename.substr(i);      
    tmp_path = req.files.file.path;

    console.log("destination is " + req.body.destination);
    // Get target path
    if (req.body.destination !== null && req.body.destination !== undefined) {
        for (key in directoryMapping) {
            if (key == req.body.destination) {
                target_path = myDirectory + directoryMapping[key] + filename;
            }
        }
    }

    console.log("tmp_path is " + tmp_path);
    console.log("target_path is " + target_path);
    console.log("file_extension is " + file_extension);
    console.log("size");
    console.log(req.files.file.size);
    console.log("body");
    console.log(req.body);
    console.log("type " + req.files.file.type);
    // console.log(req.files.file.toJSON());

    if((file_extension in oc(extensionAllowed)) && ((req.files.file.size /1024 ) < maxSizeOfFile)) { 
        
        console.log("file passed validation");
        fs.rename(tmp_path, target_path, function(err) {
            if (err) throw err; 
            // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files 
            fs.unlink(tmp_path, function() {
                if (err) throw err;
            });
        });
        data.msg = "File uploaded sucessfully";
        data.path = target_path;
        data.success = false;
        console.log("data sent back is");
        console.log(data);

    }  else{
    // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files 
        fs.unlink(tmp_path, function(err) {
            if (err) throw err;
        });
        data.msg = "File upload failed. File extension not allowed and size must be less than "+maxSizeOfFile;
        data.success = false;
        data.path = "";
        console.log(data)
        res.send(400, data);
        // return res.send(200, "File upload failed.File extension not allowed and size must be less than "+maxSizeOfFile);
    }
    return res.send(200, data);
};

function oc(a){
    var o = {};
    for(var i=0;i<a.length;i++) {
        o[a[i]]='';
    }
    return o; 
}

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
        return res.send(400, 'Bad source directory specified.');
    } 

    // Request: read a file
    if (req.query.action == 'read') {
        directory = directory + req.query.file;
        fs.readFile(directory, 'utf8', function(err, data) {
            if (err) {
                console.log('fs.readFile error');
                console.log(err);
                return res.send(500, err);
            }
            console.log('File read: ' + directory);
            return res.send(200, data);
        })

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
                        return res.send(500, err);
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
                    return res.send(200, data);
                });

            } else {
                // Use yaml file for file contents
                try {                
                    data.result = yaml.safeLoad(content);
                    return res.send(200,data);
                } catch (e) {
                    console.log(e);
                    return res.send(500,e);
                }              
            }
        })
        
    }
};
