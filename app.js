
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , files = require('./routes/files')
  , rwfind = require('./routes/rwfind')
  , cifbulk = require('./routes/cifbulk')
  , crosscor = require('./routes/crosscor')
  , anon = require('./routes/anon')
  , data = require('./routes/data')
  // , ipgrep = require('./routes/ipgrep')
  , utils = require('./util')
  , http = require('http')
  , https = require('https')
  , fs = require('fs')
  , path = require('path')
  , config = require('./config');

var sslOptions = {
  key: fs.readFileSync('./cert/server.key'),
  cert: fs.readFileSync('./cert/server.crt'),
  ca: fs.readFileSync('./cert/ca.crt'),
  requestCert: true,
  rejectUnauthorized: false
};

var app = module.exports = express();

app.engine('html', require('ejs').renderFile);

// all environments
app.set('port', config.port);
app.set('sslport', config.sslport);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
// For handling uploads
app.use(express.bodyParser({
  keepExtensions: true,
  uploadDir: (path.join(__dirname,'/tmp'))
}));
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);
app.get('/users', user.list);
app.post('/upload', files.upload);
app.get('/files', files.files);
// app.get('/ipgrep', ipgrep.call);
app.get('/cifbulk', cifbulk.list);
app.get('/crosscor', crosscor.list);
app.get('/anon', anon.list);
app.get('/rwfind', rwfind.list);
app.get('/data', data.list);
app.get('*', routes.index);

// Handle cross-domain requests
// NOTE: Uncomment this funciton to enable cross-domain request.
/*
  app.options('/upload', function(req, res){
  console.log('OPTIONS');
  res.send(true, {
  'Access-Control-Allow-Origin': '*'
  }, 200);
  });
*/


https.createServer(sslOptions,app).listen(app.get('sslport'), function(){
  console.log('Express server listening on port ' + app.get('sslport'));
});

