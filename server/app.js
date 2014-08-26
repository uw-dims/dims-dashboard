
/**
 * Module dependencies.
 */

var express = require('express')
  , bodyParser = require('body-parser')
  , compress = require('compression')
  , cookieSession = require('cookie-session')
  , json = require('express-json')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , favicon = require('serve-favicon')
  , responseTime = require('response-time')
  , errorHandler = require('errorhandler')
  , methodOverride = require('method-override')
  , timeout = require('connect-timeout')
  , vhost = require('vhost')
  , csrf = require('csurf')
  , http = require('http')
  , https = require('https')
  , fs = require('fs')
  , path = require('path')
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
  , config = require('./config');

var sslOptions = {
  key: fs.readFileSync(config.server_key),
  cert: fs.readFileSync(config.server_crt)
  //ca: fs.readFileSync(config.server_ca)
  //requestCert: true,
  //rejectUnauthorized: false
};

console.log (sslOptions.key);
console.log(sslOptions.cert);
console.log(config.sslOn);

var app = module.exports = express();
var env = process.env.NODE_ENV || 'development';

app.engine('html', require('ejs').renderFile);

// all environments
app.set('port', config.port);
app.set('sslport', config.sslport);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
//app.use(favicon());
app.use(logger('dev'));
// For handling uploads
// app.use(bodyParser.urlencoded({
//   extended: true,
//   keepExtensions: true)
// }));
app.use(json());
app.use(methodOverride());
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(app.router);

// development only
if (env === 'development') {
  app.set('views', path.join(__dirname, '../client/dashboard'));
  app.use(errorHandler());
  app.use(express.static(path.join(__dirname, '../client')));
  app.use(express.static(path.join(__dirname, '.tmp')));
  app.use(express.static(path.join(__dirname, '../client/dashboard')));
  app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

if (env === 'production') {
    app.set('views', path.join(__dirname, '/dist'));
    app.use(express.static(path.join(__dirname, '/dist')));
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}
// app.get('/', routes.index);
// app.get('/partials/:name', routes.partials);
// app.get('/users', user.list);
var router = express.Router();
router.post('/upload', files.upload);
router.get('/files', files.files);
// app.get('/ipgrep', ipgrep.call);
router.get('/cifbulk', cifbulk.list);
router.get('/crosscor', crosscor.list);
router.get('/anon', anon.list);
router.get('/rwfind', rwfind.list);
router.get('/data', data.list);
router.get('*', routes.index);

app.use('/', router);
// app.get('*', routes.index);

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

if (config.sslOn) {
  https.createServer(sslOptions,app).listen(app.get('sslport'), function(){
   console.log('Express server listening on port ' + app.get('sslport'));
  });
} else {
  https.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
}



