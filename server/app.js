
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
  , users = require('./routes/users')
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

// Get the user model so Passport can use it
var userdata = require('./models/user')(Bookshelf);

// Passport functions - will put in separate file later
// Serialize the user info
passport.serializeUser(function(user, done) {
  logger.debug('passport serializeUser. user is ');
  console.log(user);
    done(null, user.get('ident'));
});
// Deserialize the user info
passport.deserializeUser(function(ident, done) {
    // console.log("passport deserializeUser. ident is " + ident);
    new userdata.User({ident: ident}).fetch().then(function(user) {
        // user here is retrieved from database so can use .get functions
        // returning user - should it be user.get('ident')?
        logger.debug('passport deserializeUser - retrieved user', user.get('ident'), user.get('affiliation'));
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
    logger.debug('passport.use');
    new userdata.User({ident: username}).fetch({require: true}).then(function(user) {
      // user here is user obtained from User model
        var pw = user.get('password');
        // var program = 'perl -e "print crypt(\'' + password + '\',\'' + pw + '\');"';
        
        var program = 'perl ./utils/getPass.pl ' + password + ' ' + '\''+pw+'\'';
        logger.debug('passport.use', program);
        exec(program, function(error, stdout, stderr) {
            logger.debug('passport.use: perl stdout ' , stdout);
            logger.debug('passport.use: perl stderr ' , stderr);
            if (error !== null) {
                logger.error('passport.use: exec error: ' , error);
                return done(null, false, {'message': 'Error'});
            } 
            if (pw === stdout) {
              logger.debug('passport.use: Passwords match. Return user');
                return done(null, user);
            }
            return done(null, false, { 'message': 'Invalid password'});
        });
        
    }, function(error) {
        return done(null, false, { 'message': 'Unknown user'});
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
// router.post('/settings', ensureAuthenticated, settings.create);
// router.delete('/settings/:id', ensureAuthenticated, settings.delete);

// router.get('/users:ident', ensureAuthenticated, users.show);

router.get('/auth/session', ensureAuthenticated, require('./routes/session').session);
router.post('/auth/session', require('./routes/session').login);
router.delete('/auth/session', require('./routes/session').logout);

// Route to test if user is logged in
// router.get('/loggedin', function(req, res) {
  // User this later
  // res.send(req.isAuthenticated() ? req.user : '0');
  // res.send(req.user);
// })


// router.get('/session/set/:value', function(req,res) {
//   req.session.
// });

router.get('*', ensureAuthenticated, routes.index);

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



