
var express = require('express')
  , bodyParser = require('body-parser')
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
  , utils = require('./utils/util')
  , config = require('./config')
  , session = require('express-session')
  , redis = require('redis')
  , redisStore = require('connect-redis')(session)
  , pg = require('pg')
  , sql = require('sql')
  , socket = require('socket.io')
  , flash = require('connect-flash')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , exec = require('child_process').exec
  , messages = require('./utils/messages')
  , logger = require('./utils/logger');

// routes
var routes = require('./routes')
  // , users = require('./routes/users')
  , files = require('./routes/files')
  , rwfind = require('./routes/rwfind')
  , cifbulk = require('./routes/cifbulk')
  , crosscor = require('./routes/crosscor')
  , anon = require('./routes/anon')
  , data = require('./routes/data')
  , logmon = require('./routes/logmon')
  , chat = require('./routes/chat')
  , settings = require('./routes/settings');

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

// Set up postgresql connection data to user database
var dbConfig = {
  client: 'postgresql',
  connection: {
    host: 'localhost',
    user: 'dims',
    database: 'ops-trust'
  }
};

// Initialize Bookshelf ORM and connect
var knex = require('knex')(dbConfig);
var Bookshelf = require('bookshelf')(knex, {debug:true});

// Add virtuals plug-in
Bookshelf.plugin('virtuals');
// Make express setting so can be used elsewhere
app.set('Bookshelf', Bookshelf);
// Make redisClient available to routes:
app.set('client', redisClient);

// Get the user model so Passport can use it
var userdata = require('./models/user')(Bookshelf);

// Passport functions - will put in separate file later
// Serialize the user info
passport.serializeUser(function(user, done) {
  logger.debug('10 passport serializeUser. user ident is ', user.get('ident'));
  done(null, user.get('ident'));
});
// Deserialize the user info
passport.deserializeUser(function(ident, done) {
    // console.log("passport deserializeUser. ident is " + ident);
    new userdata.User({ident: ident}).fetch().then(function(user) {
        // user here is retrieved from database so can use .get functions
        // returning user - should it be user.get('ident')?
        return done(null, user);
    }, function(error) {
        return done(error);
    });
});
// Use LocalStrategy and set function to check password
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
},function(username, password, done) {
    // Look up the user corresponding to the supplied username
    new userdata.User({ident: username}).fetch({require: true}).then(function(user) {
      // Call perl crypt to check password since we are using passwords generated using crypt
        var pw = user.get('password');        
        var program = 'perl ./utils/getPass.pl ' + password + ' ' + '\''+pw+'\'';
        exec(program, function(error, stdout, stderr) {
            logger.debug('5 passport.use: perl stderr ' , stderr);
            if (error !== null) {
                logger.error('passport.use: exec error: ' , error);
                return done(null, false, 'Perl error');
            } 
            if (pw === stdout) {
              logger.debug('6 passport.use: Passwords match. Return user');
              // We are passing back user record
                return done(null, user);
            }
            return done(null, false, 'Invalid password');
        });
        
    }, function(error) {
        return done(null, false, 'Unknown user');
    });
}));

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
  extended: false
}));
app.use(bodyParser.json());
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

// Disabled for now - socket.io inundates the logs
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

// Middleware to be used for every secured route
var ensureAuthenticated = function(req, res, next) {
  if (!req.isAuthenticated()) {
    logger.debug('ensureAuthenticated: Request is not authenticated. Return 401');
    res.status(401).send();
  } else {
    logger.debug('ensureAuthenticated: Request is authenticated.');
    return next();
  }
};

var router = express.Router();
router.post('/upload', ensureAuthenticated, files.upload);
router.get('/files', ensureAuthenticated, files.files);
// app.get('/ipgrep', ipgrep.call);
router.get('/cifbulk', ensureAuthenticated, cifbulk.list);
router.get('/crosscor', ensureAuthenticated, crosscor.list);
router.post('/anon', ensureAuthenticated, anon.list);
router.get('/rwfind', ensureAuthenticated, rwfind.list);
router.get('/data', ensureAuthenticated, data.list);

// Set up routes for rabbitmq connection for logging and chat
router.get('/start-logmonitor', ensureAuthenticated, logmon.start);
router.get('/stop-logmonitor', ensureAuthenticated, logmon.stop);
router.get('/status-logmonitor', ensureAuthenticated, logmon.status);

router.get('/start-chat', ensureAuthenticated, chat.start);
router.get('/stop-chat', ensureAuthenticated, chat.stop);
router.get('/status-chat', ensureAuthenticated, chat.status);

// Settings api - now just doing GET one setting, PUT
router.get('/settings/:id', ensureAuthenticated, settings.get);
router.put('/settings/:id', ensureAuthenticated, settings.update);
router.post('/settings', ensureAuthenticated, settings.create);
// router.delete('/settings/:id', ensureAuthenticated, settings.delete);

// router.get('/users:ident', ensureAuthenticated, users.show);

// authorization
router.get('/auth/session', ensureAuthenticated, require('./routes/session').session);
router.post('/auth/session', require('./routes/session').login);
router.delete('/auth/session', require('./routes/session').logout);

// user session
router.get('/session', ensureAuthenticated, require('./routes/usersession').session);

router.get('*', ensureAuthenticated, routes.index);

app.use('/', router);

// Handle cross-domain requests
// NOTE: Uncomment this function to enable cross-domain request.
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

// Set up socket.io to listen on same port as https
var io = socket.listen(server);

server.listen(port);

require('./services/socketConnection.js')(io);



