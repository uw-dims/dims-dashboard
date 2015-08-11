'use strict';

var express = require('express')
  , bodyParser = require('body-parser')
 // , compress = require('compression')
 // , cookieSession = require('cookie-session')
  , json = require('express-json')
  , cookieParser = require('cookie-parser')
 // , favicon = require('serve-favicon')
 // , responseTime = require('response-time')
  , errorHandler = require('errorhandler')
  , methodOverride = require('method-override')
 // , timeout = require('connect-timeout')
 // , vhost = require('vhost')
 // , csrf = require('csurf')
  , http = require('http')
  , https = require('https')
  , fs = require('fs')
  , path = require('path')
  , config = require('./config/config')
  , session = require('express-session')
  , RedisStore = require('connect-redis')(session)
  // , pg = require('pg')
  // , sql = require('sql')
  , socket = require('socket.io')
  //, flash = require('connect-flash')
  //, exec = require('child_process').exec
 // , messages = require('./utils/messages')
 // , CryptoJS = require('crypto-js')
  , logger = require('./utils/logger');

// routes
var routes = require('./routes')
  // , users = require('./routes/users')
  , files = require('./routes/files')
  , rwfind = require('./routes/rwfind')
  // , cifbulk = require('./routes/cifbulk')
  , crosscor = require('./routes/crosscor')
  // , anon = require('./routes/anon')
  , data = require('./routes/data');

// Dependency injection container
var diContainer = require('./services/diContainer')();
diContainer.register('client', require('./utils/redisDB'));
diContainer.factory('db', require('./utils/redisProxy'));
diContainer.factory('UserSettings', require('./models/userSettings'));
diContainer.factory('Ticket', require('./models/ticket'));
diContainer.factory('FileData', require('./models/fileData'));
diContainer.factory('Notification', require('./models/notification'));
diContainer.factory('settingsRoute', require('./routes/settings'));
diContainer.factory('sessionRoute', require('./routes/session'));
diContainer.factory('ticketRoute', require('./routes/ticket'));
diContainer.factory('fileDataRoute', require('./routes/fileData'));
diContainer.factory('notificationRoute', require('./routes/notification'));
diContainer.factory('cifbulkRoute', require('./routes/cifbulk'));
diContainer.factory('anonRoute', require('./routes/anon'));
diContainer.factory('anonService', require('./services/anonymize'));

// diContainer.factory('ticketService', require('./services/ticket'));

var sessionRoute = diContainer.get('sessionRoute');
var settingsRoute = diContainer.get('settingsRoute');
var ticketRoute = diContainer.get('ticketRoute');
var fileDataRoute = diContainer.get('fileDataRoute');
var cifbulkRoute = diContainer.get('cifbulkRoute');
var anonRoute = diContainer.get('anonRoute');

var app = module.exports = express();

app.engine('html', require('ejs').renderFile);

// all environments
app.set('port', config.port);
app.set('sslport', config.sslport);
//app.set('views', __dirname + '/views');
app.set('view engine', 'html');
//app.use(favicon());
app.use(json());
app.use(methodOverride());
app.use(bodyParser.urlencoded({
  extended: false,
  limit: '50mb'
}));
app.use(bodyParser.json());
//app.use(flash());

//var redisClient = require('./utils/redisDB');

// Cookies and session
app.use(cookieParser(config.cookieSecret));
app.use(session({
  secret: config.sessionSecret,
  store: new RedisStore ({
    host: config.redisHost,
    port: config.redisPort,
    client: require('./utils/redisDB'),
    // Session time to live - one hour for now - will force logout regardless of activity
    ttl: config.sessionTTL
  }),
  saveUninitialized: false, // don't create session until something stored
  resave: false // don't save session if unmodified
}));


// Disabled for now - Do we need to log http requests? This will generate a lot of output
// Override Express logging - stream logs to logger
// app.use(require('morgan') ('common',{
//   'stream': logger.stream
// }));


// development only
if (config.env === 'development') {
  app.set('views', path.join(__dirname, '../client/dashboard'));
  app.use(errorHandler());
  app.use(express.static(path.join(__dirname, '../client')));
  app.use(express.static(path.join(__dirname, '.tmp')));
  app.use(express.static(path.join(__dirname, '../client/dashboard')));
  app.use(function (err, req, res, next) {
    /* jshint unused: false */
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

if (config.env === 'production') {
  app.set('views', path.join(__dirname, '../public'));
  app.use(express.static(path.join(__dirname, '../public')));
  app.use(function (err, req, res, next) {
    /* jshint unused: false */
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
}

// Set app to use Passport depending on user backend
if (config.userSource === config.POSTGRESQL) {
  logger.info('Dashboard initialization: Using POSTGRESQL backend.');
  app.use(require('./services/passport.js').initialize());
  app.use(require('./services/passport.js').session());
} else {
  logger.info('Dashboard initialization: Using STATIC backend for testing');
  app.use(require('./services/passport-static.js').initialize());
  app.use(require('./services/passport-static.js').session());
}

// Middleware to be used for every secured route
var ensureAuthenticated = function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.status(401).send();
  } else {
    return next();
  }
};

var router = express.Router();
router.post('/upload', ensureAuthenticated, files.upload);
router.get('/files', ensureAuthenticated, files.files);
router.get('/cifbulk', ensureAuthenticated, cifbulkRoute.list);
router.get('/crosscor', ensureAuthenticated, crosscor.list);
router.post('/anon', ensureAuthenticated, anonRoute.anonymize);
router.get('/rwfind', ensureAuthenticated, rwfind.list);
router.get('/data', ensureAuthenticated, data.list);

// Set up routes for rabbitmq connection for logging and chat
// Not used - deprecated
// router.get('/start-logmonitor', ensureAuthenticated, logmon.start);
// router.get('/stop-logmonitor', ensureAuthenticated, logmon.stop);
// router.get('/status-logmonitor', ensureAuthenticated, logmon.status);

// router.get('/start-chat', ensureAuthenticated, chat.start);
// router.get('/stop-chat', ensureAuthenticated, chat.stop);
// router.get('/status-chat', ensureAuthenticated, chat.status);

// User Settings api
router.get('/settings', ensureAuthenticated, settingsRoute.get);
router.post('/settings', ensureAuthenticated, settingsRoute.update);

// Tickets
// Get all tickets (ticket objects)
router.get('/api/ticket', ticketRoute.list);
// Create a ticket
router.post('/api/ticket', ticketRoute.create);
// Get one ticket (ticket object, ticket key, array of topic keys)
router.get('/api/ticket/:id', ticketRoute.show);
// Update one ticket
router.put('/api/ticket/:id', ticketRoute.update);
// Delete one ticket
router.delete('/api/ticket/:id', ticketRoute.delete);
// Add a new topic to a ticket
router.post('/api/ticket/:id/topic', ticketRoute.addTopic);
// Get one topic (ticket object, topic object, contents)
router.get('/api/ticket/topic/:id', ticketRoute.showTopic);
// Update one topic
router.put('/api/ticket/topic/:id', ticketRoute.updateTopic);
// Delete a topic
router.delete('/api/ticket/topic/:id', ticketRoute.deleteTopic);

// Get list of all files (global)
router.get('/api/fileData', fileDataRoute.list);
// Get list of all files for a user
router.get('/api/fileData/user/:id', fileDataRoute.list);
// Get contents of a file
router.get('/api/fileData/:path', fileDataRoute.show);
// Create new file (global)
router.post('/api/fileData', fileDataRoute.create);
// Update an existing file
router.put('/api/fileData/:path', fileDataRoute.update);
// Delete a file
router.delete('/api/fileData/:path', fileDataRoute.delete);

// authorization
router.get('/auth/session', ensureAuthenticated, sessionRoute.session);
router.post('/auth/session', sessionRoute.login);
router.delete('/auth/session', sessionRoute.logout);

// user session - will delete
// router.get('/session', ensureAuthenticated, require('./routes/usersession').session);
router.get('/*', ensureAuthenticated, routes.index);

app.use('/', router);

// Handle cross-domain requests
// NOTE: Uncomment this function to enable cross-domain request.
/*
  app.options('/upload', function (req, res){
  console.log('OPTIONS');
  res.send(true, {
  'Access-Control-Allow-Origin': '*'
  }, 200);
  });
*/
if (config.sslOn) {
  logger.debug('Dashboard initialization: SSL is on');
  var sslOptions = {
    key: fs.readFileSync(config.serverKey),
    cert: fs.readFileSync(config.serverCrt)
    //ca: fs.readFileSync(config.serverCa∆Ô)
    //requestCert: true,
    //rejectUnauthorized: false
  };
  var server = https.createServer(sslOptions, app);
  var port = app.get('sslport');
} else {
  logger.debug('Dashboard initialization: SSL is off');
  var server = http.createServer(app);
  var port = app.get('port');
}

// Set up socket.io to listen on same port as https
var io = socket.listen(server);

// Set up sockets
var RabbitSocket = require('./services/rabbitSocket');
// Create publishers first so their publish method can be added as event listeners
var chatPublisher = new RabbitSocket('chat', 'publisher');
// Set up chat socket
var chat = io
  .of('/chat')
  .on('connection', function (socket) {

    var info = {
      connectionID: socket.conn.id,
      serverAddr: socket.conn.remoteAddress
    };
    logger.debug('Chat socket.io. Received client connection event: ', info);
    // Send message to fanout when received from client on socket
    socket.on('chat:client', function (msg) {
      logger.debug('Chat socket.io: Received client event from client. ConnectionID: ', socket.conn.id, ' msg: ', msg);
      chatPublisher.send(msg);
    });
    socket.on('disconnect', function (evt) {
      /* jshint unused: false */
      logger.debug('Chat socket.io: Received disconnect event from client. ConnectionID: ', socket.conn.id);
    });
  });
// Set up logs socket
var logs = io
  .of('/logs')
  .on('connection', function (socket) {

    var info = {
      connectionID: socket.conn.id,
      serverAddr: socket.conn.remoteAddress
    };
    logger.debug('Logs socket.io. Received client connection event: ', info);
    socket.on('disconnect', function (evt) {
      /* jshint unused: false */
      logger.debug('Logs socket.io: Received disconnect event from client. ConnectionID: ', socket.conn.id);
    });
  });

server.listen(port);
logger.info('Dashboard initialization: DIMS Dashboard running on port %s', server.address().port);
logger.info('Dashboard initialization: REDIS host, port, database: ', config.redisHost, config.redisPort, config.redisDatabase);
logger.info('Dashboard initialization: Node environment: ', config.env);
logger.info('Dashboard initialization: Log level:', config.logLevel);
logger.info('Dashboard initialization: UserDB source: ', config.userSource);
// Create subscribers
var chatSubscriber = new RabbitSocket('chat', 'subscriber', chat);
var logSubscriber = new RabbitSocket('logs', 'subscriber', logs);



