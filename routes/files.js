
var fs = require('fs');
exports.upload = function(req, res){
  var filename = req.files.file.name;
    var extensionAllowed = [".txt", ".json"];
    var maxSizeOfFile = 200;
    var msg = "";
    var i = filename.lastIndexOf('.');
    // Get temporary location
    var tmp_path = req.files.file.path;
    console.log("tmp_path is " + tmp_path);
    var target_path = './upload/' + req.files.file.name; 
    console.log("target_path is " + target_path);
    var file_extension= (i < 0) ? '' : filename.substr(i); 
    console.log("file_extension is " + file_extension);
    console.log("req.files");
    console.log(req.files);
    console.log("req.files.file");
    console.log(req.files.file);
    console.log("size");
    console.log(req.files.file.size);
    console.log("body");
    console.log(req.body);
    console.log("type " + req.files.file.type);
    console.log(req.files.file.toJSON());
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
