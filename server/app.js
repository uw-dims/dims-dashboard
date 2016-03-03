/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
'use strict';

var express = require('express')
  , config = require('./config/config')
  , bodyParser = require('body-parser')
  , expressValidator = require('express-validator')
  , _ = require('lodash-compat')
 // , compress = require('compression')
 // , cookieSession = require('cookie-session')
  , json = require('express-json')
  , cookieParser = require('cookie-parser')
  , favicon = require('serve-favicon')
  , errorHandler = require('errorhandler')
  , methodOverride = require('method-override')
  , multer = require('multer')
  , http = require('http')
  , https = require('https')
  , fs = require('fs')
  , path = require('path')
  , session = require('express-session')
  , RedisStore = require('connect-redis')(session)
  , socket = require('socket.io')
  //, flash = require('connect-flash')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , JwtStrategy = require('passport-jwt').Strategy
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
  // , cors = require('cors')

// routes
var routes = require('./routes');

// Dependency injection
var diContainer = require('./services/diContainer')();
diContainer.register('client', require('./utils/redisDB'));
diContainer.factory('db', require('./utils/redisProxy'));
diContainer.register('Bookshelf', require('./utils/bookshelf'));
diContainer.factory('UserSettings', require('./models/userSettings'));
diContainer.factory('Ticket', require('./models/ticket'));
diContainer.factory('UserModel', require('./models/user'));
diContainer.factory('Attributes', require('./models/attributes'));
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
diContainer.factory('userService', require('./services/user'));
diContainer.factory('auth', require('./services/authentication'));
diContainer.factory('access', require('./services/authorization'));
diContainer.factory('authAccount', require('./models/authAccount'));
diContainer.factory('accountRoute', require('./routes/account'));
diContainer.factory('stixRoute', require('./routes/stix'));
diContainer.factory('stixService', require('./services/stix'));
diContainer.factory('tupeloRoute', require('./routes/tupelo'));
diContainer.factory('tupeloService', require('./services/tupelo'));
diContainer.factory('amqpClient', require('./services/amqpClient'));

// These are used here in app.js
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
var auth = diContainer.get('auth');
var userRoute = diContainer.get('userRoute');
var attributeRoute = diContainer.get('attributeRoute');
var lmsearchRoute = diContainer.get('lmsearchRoute');
var accountRoute = diContainer.get('accountRoute');
var stixRoute = diContainer.get('stixRoute');
var tupeloRoute = diContainer.get('tupeloRoute');

// var userService = diContainer.get('userService');
// var authAccount = diContainer.get('authAccount');

var app = module.exports = express();

// var corsOptions = {
//   origin: true,
//   credentials: true
// };
// console.log('corsOptions', corsOptions);
// app.use(cors(corsOptions));

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

// Custom validators:
// isArray - check that the value is an array
// isValidtype - check that the value is contained in an array
//    of acceptable values (types)
app.use(expressValidator({
  customValidators: {
    isArray: function (value) {
      return Array.isArray(value);
    },
    isValidType: function (value, types) {
      return _.includes(types, value);
    }
  }
}));
// Currently not used
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
  app.use(favicon(path.join(__dirname, '../client/dashboard/images/default/UW-logo-16x16.ico')));
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

// Set up passport
passport.use(
  new LocalStrategy(config.localStrategyConfig, auth.localStrategyVerify));
passport.use(
  new JwtStrategy(config.jwtStrategyConfig, auth.jwtStrategyVerify));
passport.use(
  new GoogleStrategy(config.googleStrategyConfig, auth.googleStrategyVerify));
// Override default strategy name to use for authorization (connect);
passport.use('google-authz',
  new GoogleStrategy(config.googleAuthzStrategyConfig, auth.googleConnectVerify));

// We're using sessions as well as token. Need session so we can access logged in
// user when connecting to a social auth account like Google
passport.serializeUser(auth.serialize);
passport.deserializeUser(auth.deserialize);

app.use(passport.initialize());
app.use(passport.session());

// Set up routes
var router = express.Router();
router.post('/upload', auth.ensureAuthenticated, filesRoute.upload);
router.get('/files', auth.ensureAuthenticated, filesRoute.files);
router.get('/cifbulk', auth.ensureAuthenticated, cifbulkRoute.list);
router.get('/crosscor', auth.ensureAuthenticated, crosscorRoute.list);
router.post('/anon', auth.ensureAuthenticated, anonRoute.anonymize);
router.get('/rwfind', auth.ensureAuthenticated, rwfindRoute.list);
router.get('/data', auth.ensureAuthenticated, dataRoute.list);

router.get('/api/lmsearch', auth.ensureAuthenticated, lmsearchRoute.list);

// User Settings api
router.get('/settings', auth.ensureAuthenticated, settingsRoute.get);
router.post('/settings', auth.ensureAuthenticated, settingsRoute.update);

router.get('/api/attributes', auth.ensureAuthenticated, attributeRoute.list);
router.get('/api/attributes/:id', auth.ensureAuthenticated, attributeRoute.show);
router.put('/api/attributes/:id', auth.ensureAuthenticated, attributeRoute.update);

// Get all users
router.get('/api/user', auth.ensureAuthenticated, userRoute.list);
// Get one user
router.get('/api/user/:id', auth.ensureAuthenticated, userRoute.show);

// Tickets
// Get all tickets (ticket objects)
router.get('/api/ticket', auth.ensureAuthenticated, ticketRoute.list);
// Create a ticket
router.post('/api/ticket', auth.ensureAuthenticated, ticketRoute.create);
// Get one ticket (ticket object, ticket key, array of topic keys)
router.get('/api/ticket/:id', auth.ensureAuthenticated, ticketRoute.show);
// Update one ticket
router.put('/api/ticket/:id', auth.ensureAuthenticated, ticketRoute.update);
// Delete one ticket
router.delete('/api/ticket/:id', auth.ensureAuthenticated, ticketRoute.delete);
// Add a new topic to a ticket
router.post('/api/ticket/:id/topic', auth.ensureAuthenticated, ticketRoute.addTopic);
// Get one topic (ticket object, topic object, contents)
router.get('/api/ticket/topic/:id', auth.ensureAuthenticated, ticketRoute.showTopic);
// Update one topic
router.put('/api/ticket/topic/:id', auth.ensureAuthenticated, ticketRoute.updateTopic);
// Delete a topic
router.delete('/api/ticket/topic/:id', auth.ensureAuthenticated, ticketRoute.deleteTopic);

var upload = multer({ dest: config.uploadPath});
// Process stix
router.post('/api/stix', auth.ensureAuthenticated, upload.any(), stixRoute.post);

router.post('/api/tupelo', auth.ensureAuthenticated, tupeloRoute.post);


// Get list of all files (global)
router.get('/api/fileData', auth.ensureAuthenticated, fileDataRoute.list);
// Get list of all files for a user
router.get('/api/fileData/user/:id', auth.ensureAuthenticated, fileDataRoute.list);
// Get contents of a file
router.get('/api/fileData/:path', auth.ensureAuthenticated, fileDataRoute.show);
// Create new file (global)
router.post('/api/fileData', auth.ensureAuthenticated, fileDataRoute.create);
// Update an existing file
router.put('/api/fileData/:path', auth.ensureAuthenticated, fileDataRoute.update);
// Delete a file
router.delete('/api/fileData/:path', auth.ensureAuthenticated, fileDataRoute.delete);

// Get session info for user making request
router.get('/auth/session', auth.ensureAuthenticated, sessionRoute.session);
// Handle user login with user/pass and send token
router.post('/auth/session', sessionRoute.tokenLogin);
// Handle user logout
router.delete('/auth/session', sessionRoute.logout);
// Route that handles social account inquiry for a user
router.get('/auth/connect', auth.ensureAuthenticated, accountRoute.list);
// Route that handles disconnection of a social account for a user
router.delete('/auth/connect/:service', auth.ensureAuthenticated, accountRoute.delete);

// Redirect user to Google for authentication. When complete, Google will redirect
// user back to this application at config.googleCallback
router.get(config.googleURL, passport.authenticate(
  'google',
  {scope: ['https://www.googleapis.com/auth/userinfo.profile',
           'https://www.googleapis.com/auth/userinfo.email']
  }));

// Route for google connect. Will redirect to Google for authentication.
router.get(config.googleConnectURL, passport.authorize(
  'google-authz',
  {
  scope: ['https://www.googleapis.com/auth/userinfo.profile',
           'https://www.googleapis.com/auth/userinfo.email']}
  ));

// Route that handles google login callback
router.get(config.googleCallback, sessionRoute.googleLogin);
// Route that handles successful google login redirect
router.get('/socialauth', routes.index);
// Route that handles google connect callback
router.get(config.googleConnectCallback,
    passport.authorize('google-authz', {
    failureRedirect: '/userinfo/settings'}), sessionRoute.googleConnect);

router.get('/*', routes.index);

app.use('/', router);

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
