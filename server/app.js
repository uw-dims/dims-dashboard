'use strict';

var express = require('express')
  , config = require('./config/config')
  , bodyParser = require('body-parser')
 // , compress = require('compression')
 // , cookieSession = require('cookie-session')
  , json = require('express-json')
  , cookieParser = require('cookie-parser')
 // , favicon = require('serve-favicon')
  , errorHandler = require('errorhandler')
  , methodOverride = require('method-override')
  , http = require('http')
  , https = require('https')
  , fs = require('fs')
  , path = require('path')
  , session = require('express-session')
  , RedisStore = require('connect-redis')(session)
  , socket = require('socket.io')
  //, flash = require('connect-flash')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

// routes
var routes = require('./routes');

// Dependency injection container
var diContainer = require('./services/diContainer')();
diContainer.register('client', require('./utils/redisDB'));
diContainer.factory('db', require('./utils/redisProxy'));
diContainer.register('Bookshelf', require('./utils/bookshelf'));
diContainer.factory('UserSettings', require('./models/userSettings'));
diContainer.factory('Ticket', require('./models/ticket'));
diContainer.factory('UserModel', require('./models/user'));
diContainer.factory('Attributes', require('./models/attributes'));
diContainer.factory('passportPostgres', require('./services/passportPostgres'));
diContainer.factory('passportStatic', require('./services/passportStatic'));
diContainer.factory('FileData', require('./models/fileData'));
diContainer.factory('tools', require('./services/tools'));
diContainer.factory('Notification', require('./models/notification'));
diContainer.factory('settingsRoute', require('./routes/settings'));
diContainer.factory('sessionRoute', require('./routes/session'));
diContainer.factory('ticketRoute', require('./routes/ticket'));
diContainer.factory('fileDataRoute', require('./routes/fileData'));
diContainer.factory('notificationRoute', require('./routes/notification'));
diContainer.factory('cifbulkRoute', require('./routes/cifbulk'));
diContainer.factory('anonRoute', require('./routes/anon'));
diContainer.factory('anonService', require('./services/anonymize'));
diContainer.factory('filesRoute', require('./routes/files'));
diContainer.factory('rwfindRoute', require('./routes/rwfind'));
diContainer.factory('crosscorRoute', require('./routes/crosscor'));
diContainer.factory('dataRoute', require('./routes/data'));
diContainer.factory('userRoute', require('./routes/user'));
diContainer.factory('attributeRoute', require('./routes/attributes'));
diContainer.factory('lmsearchRoute', require('./routes/lmsearch'));
diContainer.factory('mitigationService', require('./services/mitigation'));
diContainer.factory('ticketService', require('./services/ticket'));
diContainer.factory('healthService', require('./services/healthService'));
diContainer.factory('store', require('./models/store'));
diContainer.factory('Topic', require('./models/topic'));
diContainer.factory('attributeService', require('./services/attributes'));

// diContainer.factory('ticketService', require('./services/ticket'));

// These are used here
var sessionRoute = diContainer.get('sessionRoute');
var settingsRoute = diContainer.get('settingsRoute');
var ticketRoute = diContainer.get('ticketRoute');
var fileDataRoute = diContainer.get('fileDataRoute');
var cifbulkRoute = diContainer.get('cifbulkRoute');
var anonRoute = diContainer.get('anonRoute');
var filesRoute = diContainer.get('filesRoute');
var rwfindRoute = diContainer.get('rwfindRoute');
var crosscorRoute = diContainer.get('crosscorRoute');
var dataRoute = diContainer.get('dataRoute');
var passportPostgres = diContainer.get('passportPostgres');
var passportStatic = diContainer.get('passportStatic');
var userRoute = diContainer.get('userRoute');
var attributeRoute = diContainer.get('attributeRoute');
var lmsearchRoute = diContainer.get('lmsearchRoute');

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

// development environment
if (config.env === 'development' || config.env === 'test') {
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

// production environment
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
  passport.serializeUser(passportPostgres.serialize);
  passport.deserializeUser(passportPostgres.deserialize);
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, passportPostgres.strategy));
} else {
  passport.serializeUser(passportStatic.serialize);
  passport.deserializeUser(passportStatic.deserialize);
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, passportStatic.strategy));
}
app.use(passport.initialize());
app.use(passport.session());

// Middleware to be used for every secured route
var ensureAuthenticated = function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.set('Content-Type', 'text/html');
    res.status(401).send('<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/"></head></html>');
  } else {
    return next();
  }
};

var router = express.Router();
router.post('/upload', ensureAuthenticated, filesRoute.upload);
router.get('/files', ensureAuthenticated, filesRoute.files);
router.get('/cifbulk', ensureAuthenticated, cifbulkRoute.list);
router.get('/crosscor', ensureAuthenticated, crosscorRoute.list);
router.post('/anon', ensureAuthenticated, anonRoute.anonymize);
router.get('/rwfind', ensureAuthenticated, rwfindRoute.list);
router.get('/data', ensureAuthenticated, dataRoute.list);

router.get('/api/lmsearch', lmsearchRoute.list);

// User Settings api
router.get('/settings', ensureAuthenticated, settingsRoute.get);
router.post('/settings', ensureAuthenticated, settingsRoute.update);

// Get all attributes of all users - not implemented - do we need this?
// router.get('/api/attributes', attributeRoute.list);
router.get('/api/attributes', attributeRoute.list);
router.get('/api/attributes/:id', attributeRoute.show);
router.post('/api/attributes/:id', attributeRoute.update);

// Get all users
router.get('/api/user', userRoute.list);
// Get one user
router.get('/api/user/:id', userRoute.show);

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
var io,
    server,
    port,
    sslOptions,
    dashboardMessaging,
    appLogger,
    healthLogger;

if (config.sslOn) {
  // logger.info('Dashboard initialization: SSL is on');
  sslOptions = {
    key: fs.readFileSync(config.serverKey),
    cert: fs.readFileSync(config.serverCrt)
    //ca: fs.readFileSync(config.serverCa)
    //requestCert: true,
    //rejectUnauthorized: false
  };
  server = https.createServer(sslOptions, app);
  port = app.get('sslport');
} else {
  server = http.createServer(app);
  port = app.get('port');
}

if (require.main === module) {
  appLogger = require('./utils/appLogger');
  appLogger.on('logger-ready-logs', function () {
    console.log('[+++] appLogger received logger-ready-logs event');
  });
  healthLogger = require('./utils/healthLogger');
  healthLogger.on('logger-ready-health', function () {
    console.log('[+++] healthLogger received logger-ready-health event');
    // Run the healthService
    var healthService = diContainer.get('healthService');
    healthService.run();
    console.log('[+++] Finished running healthService');
    healthLogger.publish('dashboard initialized DIMS Dashboard running on port ' + server.address().port, config.healthID);
      if (config.sslOn) {
        healthLogger.publish('dashboard initialized SSL is on', config.healthID);
      } else {
        healthLogger.publish('dashboard initialized SSL is off', config.healthID);
      }
      healthLogger.publish('dashboard initialized Node environment: ' + config.env, config.healthID);
      healthLogger.publish('dashboard initialized Log level: ' + config.logLevel, config.healthID);
      healthLogger.publish('dashboard initialized userDB source: ' + config.userSource, config.healthID);
  });

  setTimeout(function () {
    // Set up socket.io to listen on same port as https
    io = socket.listen(server);
    // Initialize messaging - fanout publish, subscribe, sockets
    require('./services/messaging')(io);
    server.listen(port, function () {
      console.log('[+++] Server listening');
    });
  }, 2000);


} else {
  module.exports = server;
}

process.on('SIGTERM', function () {
  // logger.debug('SIGTERM received');
  healthLogger.publish('dashboard received SIGTERM, exiting...', config.healthID);
  healthLogger.connection.close();
  appLogger.connection.close();
  server.close(function () {
    console.log('Server close');
    process.exit(0);
  });
});
