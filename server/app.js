
var express = require('express')
  , compress = require('compression')
  , cookieSession = require('cookie-session')
  , json = require('express-json')
  , cookieParser = require('cookie-parser')
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
  , session = require('express-session')
  , redis = require('redis')
  , redisStore = require('connect-redis')(session)
  , socket = require('socket.io')
  , flash = require('flash');
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , logger = require('./utils/logger');

var sslOptions = {
  key: fs.readFileSync(config.server_key),
  cert: fs.readFileSync(config.server_crt)
  //ca: fs.readFileSync(config.server_ca)
  //requestCert: true,
  //rejectUnauthorized: false
};

var redisClient = redis.createClient();
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
app.use(flash());

// Cookies and session
app.use(cookieParser(config.cookieSecret));
app.use(session({
  secret: config.sessionSecret,
  store: new redisStore({
    host: 'localhost',
    port: 6379,
    client: redisClient
  }),
  saveUninitialized: false, // don't create session until something stored
  resave: false // don't save session if unmodified
}));

app.use(passport.initialize());
app.use(passport.session());

// Override Express logging - stream logs to logger
// app.use(require('morgan') ('common',{
//   'stream': logger.stream
// }));

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

// router.get('/session/set/:value', function(req,res) {
//   req.session.
// });

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
  var server = https.createServer(sslOptions, app);
  var port = app.get('sslport');
} else {
  var server = http.createServer(app);
  var port = app.get('port');
}

var io = socket.listen(server);

server.listen(port);

// exports.server = server;


// var io = socket.listen(server);

// io.sockets.on('connection', function(socket) {
//   console.log('socket io connection');
//   socket.emit('logmon:data', {hello: 'world'});
//   socket.on('logmon:start', function(data) {
//     console.log(data);
//   });
//   socket.on('logmon:stop', function(data) {
//     console.log(data);
//   })
// });


require('./services/socketConnection.js')(io);



