
var express = require('express')
  , compress = require('compression')
  , cookieSession = require('cookie-session')
  , json = require('express-json')
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
  , logmon = require('./routes/logmon')
  , chat = require('./routes/chat')
  , settings = require('./routes/settings')
  // , ipgrep = require('./routes/ipgrep')
  , utils = require('./utils/util')
  , config = require('./config')
  , logger = require('./utils/logger');

var sslOptions = {
  key: fs.readFileSync(config.server_key),
  cert: fs.readFileSync(config.server_crt)
  //ca: fs.readFileSync(config.server_ca)
  //requestCert: true,
  //rejectUnauthorized: false
};

var app = module.exports = express();
var env = process.env.NODE_ENV || 'development';

app.engine('html', require('ejs').renderFile);

// all environments
app.set('port', config.port);
app.set('sslport', config.sslport);
//app.set('views', __dirname + '/views');
app.set('view engine', 'html');
//app.use(favicon());
app.use(json());
app.use(methodOverride());

// Override Express logging - stream logs to logger
app.use(require('morgan') ('common',{
  'stream': logger.stream
}));

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

logger.debug('current directory: ' + __dirname);
logger.debug('server directory config: ' + config.serverPath);

var router = express.Router();
router.post('/upload', files.upload);
router.get('/files', files.files);
// app.get('/ipgrep', ipgrep.call);
router.get('/cifbulk', cifbulk.list);
router.get('/crosscor', crosscor.list);
router.post('/anon', anon.list);
router.get('/rwfind', rwfind.list);
router.get('/data', data.list);
// Set up routes for rabbitmq connection for logging and chat
router.get('/start-logmonitor', logmon.start);
router.get('/stop-logmonitor', logmon.stop);
router.get('/status-logmonitor', logmon.status);
router.get('/start-chat', chat.start);
router.get('/stop-chat', chat.stop);
router.get('/status-chat', chat.status);
// Settings api - now just doing GET one setting, PUT
router.get('/settings/:id', settings.get);
router.put('/settings/:id', settings.update);
router.get('*', routes.index);

app.use('/', router);

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
  var server = https.createServer(sslOptions,app).listen(app.get('sslport'), function(){
   logger.info('Startup: Express server listening on port ' + app.get('sslport'));
  });
} else {
  var server = http.createServer(app).listen(app.get('port'), function(){
    logger.info('Startup: Express server listening on port ' + app.get('port'));
  });
}

var io = require('socket.io').listen(server);



