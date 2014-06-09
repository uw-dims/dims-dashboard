
var fs = require('fs');
exports.upload = function(req, res){
    var filename, 
        tmp_path,
        i,
        file_extension,
        extensionAllowed = [".txt", ".json"],
        maxSizeOfFile = 200,
        myDirectory = './mydata/',
        target_path = './upload/',
        directoryMapping = {
            'ip_lists': 'ipFiles/',
            'map_files': 'mapFiles/',
            'data_files': 'dataFiles/'
        },
        msg = "";

    console.log("req.body.fileName " + req.body.fileName);
    console.log("req.files.file.name" + req.files.file.name);
    filename = (req.body.fileName !== null && req.body.fileName !== undefined) ? req.body.fileName : req.files.file.name;
    i = filename.lastIndexOf('.');
    file_extension = (i < 0) ? '' : filename.substr(i);      
    
    tmp_path = req.files.file.path;

    console.log("destination is " + req.body.destination);

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
        msg="File uploaded sucessfully" 

    }  else{
    // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files 
        fs.unlink(tmp_path, function(err) {
            if (err) throw err;
        });
        msg="File upload failed.File extension not allowed and size must be less than "+maxSizeOfFile; 
    }

    res.end(msg);
};

function oc(a){
    var o = {};
    for(var i=0;i<a.length;i++) {
        o[a[i]]='';
    }
    return o; 
}

exports.files = function(req,res) {
    console.log("In files route");
    console.log("dir is " + req.query.source);
    var myDirectory = './mydata/',
        directoryMapping = {
            'ip_lists': myDirectory+'ipFiles/',
            'map_files': myDirectory+'mapFiles/',
            'data_files': myDirectory+'dataFiles/',
            'default_data': './data/'
        },
        msg = '',
        directory = -1;
    if (req.query.action == 'read') {

        console.log(req.query.file);
        console.log(req.query.source);

        if (req.query.source !== null && req.query.source !== undefined) {
            for (key in directoryMapping) {
                if (key == req.query.source) {
                    directory = directoryMapping[key]+req.query.file;
                }
            }
        }
        if (directory != -1) {

            fs.readFile(directory, 'utf8', function(err, data) {
                if (err) throw err;
                console.log('File read: ' + directory);
                return res.send(200, data);
            })

        } else {
            // bad input
            return res.send(500, -1, 'Bad source directory specified.');
        }

    } else {

        if (req.query.source !== null && req.query.source !== undefined) {
            for (key in directoryMapping) {
                if (key == req.query.source) {
                    directory = directoryMapping[key];
                }
            }
        }
        if (directory !== -1) {
            fs.readdir(directory, function(err, files) {
                if (err) {
                    console.log('fs.readdir error');
                    console.log(err);
                    return res.send(500, err);
                }
                var len = files.length;
                var result = [];
                var k = 0;
                for (var i=0; i<len; i++) {
                    if (files[i].indexOf('.') !== 0) {
                        result[k] = files[i];
                        k++;
                    }

                }
                var data = {};
                data.path = directory;
                data.result = result;
                return res.send(200, data);
            });

        } else {
            // bad input
            return res.send(500, -1, 'Bad source directory specified.');
        }
    }
};
