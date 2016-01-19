'use strict';

var uuid = require('node-uuid');

var config = {};

config.appName = 'dims-dashboard';

config.publicHost = process.env.DASHBOARD_PUBLIC_HOST || 'localhost';

config.publicPort = process.env.DASHBOARD_PUBLIC_PORT || '80';

config.uuid = uuid.v4();

config.sslOn = process.env.SSL_ON || false;

config.publicProtocol = config.sslOn ? 'https' : 'http';

config.port = process.env.PORT || 3000;

config.sslport = process.env.SSL_PORT || 3030;

config.env = process.env.NODE_ENV || 'development';

config.logLevel = process.env.LOG_LEVEL || 'debug';

config.logDir = process.env.LOG_PATH || '/data/dashboard/logs/';

config.logFile = config.logDir + 'dashboard.log';

config.healthInterval = 1;

// Default is Ubuntu cert location
config.certDir = process.env.CERT_DIRECTORY || '/etc/ssl/certs/';

config.caName = process.env.CA_NAME || 'dims-ca';

config.certName = process.env.CERT_NAME || process.env.DASHBOARD_PUBLIC_HOST || 'localhost';

config.redisHost = process.env.REDIS_HOST || 'localhost';

config.redisPort = process.env.REDIS_PORT || 6379;

config.redisDatabase = process.env.REDIS_DATABASE || 0;

// Need to set these variables if using a real ops-trust db
// User would be...
config.userDBHost = process.env.USER_DB_HOST || 'localhost';
config.userDBUser = process.env.USER_DB_USER || 'dims';
config.userDatabase = process.env.USER_DATABASE || 'ops-trust';

// Passport vars and configs
config.tokenSecret = process.env.TOKEN_SECRET || 'djf83UhNH35CDjfjEFM3B9e01viY8fNqz3YXpb25wc0U';
config.tokenAlgorithm = 'HS256';
// Result is seconds
config.tokenExpiresInMinutes = 1 * 60 * 60;
config.tokenIssuer = process.env.DASHBOARD_PUBLIC_HOST || require('os').hostname();
config.localStrategyConfig = {
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: false
};

config.jwtStrategyConfig = {
  secretOrKey: config.tokenSecret,
  passReqToCallback: false
};

config.googleClientId = process.env.GOOGLE_CLIENT_ID;
config.googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
config.googleCallback = '/auth/google/callback';
config.googleCallbackURL = config.publicProtocol + '://' + config.publicHost + config.googleCallback;

config.googleStrategyConfig = {
  clientID: config.googleClientId,
  clientSecret: config.googleClientSecret,
  callbackURL: config.googleCallbackURL
};

config.sessionTTL = 7200; //Redis session expiration. 2 hours, in seconds

config.sessionSecret = '3xueis763$%STID47373deC!!QUsT8J4$';

config.cookieSecret = 'Xu9J35bq!5#kNY*n3v04aSPxoURx98wQZW';

config.passSecret = '84jd$#lk903jcy2AUEI2j4nsKLJ!lIY';

config.bin = '/opt/dims/bin/';

config.dimsenvbin = '/opt/dims/envs/dimsenv/bin/';

config.rpcbin = config.dimsenvbin;

config.rpcPath = '/opt/dims/src/prisem/rpc';

config.rpcServer = process.env.RABBITMQ_HOST || 'rabbitmq.prisem.washington.edu';

config.rpcUser = process.env.RABBITMQ_DEFAULT_USER || 'rpc_user';

config.rpcPass = process.env.RABBITMQ_DEFAULT_PASS || 'rpcm3pwd';

config.rpcPort = process.env.RABBITMQ_PORT  || '5672';

config.mapfile = '/etc/ipgrep_networks.txt';

// not used
//config.inputdir = '/opt/dims/srv/input';
// not used
//config.outputdir = '/opt/dims/srv/output';

config.data = '/opt/dims/data/dims-sample-data/';

config.serverPath = __dirname;

//config.userDataPath =  config.serverPath + '/mydata/';

//config.demoDatastorePath = config.serverPath + '/data/';


// /opt/dims/data in the Dashboard container will map to host
// /data/dashboard
config.userDataPath = '/opt/dims/data/dashboard/';
config.dashboardDataPath = '/opt/dims/data/dashboard/data/';
config.uploadPath = '/opt/dims/data/dashboard/upload/';
config.logmonPath = '/opt/dims/data/logmon/';

config.directoryMapping = {
  'ip_lists': config.userDataPath + 'ipFiles/',
  'map_files': config.userDataPath + 'mapFiles/',
  'data_files': config.userDataPath + 'dataFiles/'
};

config.defaultMapping = {
  'default_data': config.data
};

config.rpcQueueNames = {
  'cifbulk': 'cifbulk_v1',
  'anon': 'anon',
  'rwfind': 'rwfind',
  'crosscor': 'crosscor'
};

config.defaultUserSettings = {
  'anonymize': false,
  'rpcDebug': true,
  'rpcVerbose': true,
  'cifbulkQueue': 'cifbulk_v1',
  'userExternals': []
};

// The attributes we are tracking
config.defaultAttributes = ['cidr', 'domain'];

config.defaultRedisTypes = {
  'hash': 'hash',
  'string': 'string',
  'set': 'set',
  'sortedSet': 'zset'
};

// config.keyPrefixes = {
//   'userSettings': 'userSetting'
// };

config.maxUploadFileNum = 10;
config.maxUploadFileSize = 39273942;

config.serverKey = config.certDir + config.certName + '.key';
config.serverCrt = config.certDir + config.certName + '.crt';
config.serverCa = config.certDir + config.caName + '.crt';

// Sockets configuration
// receive: true if socket listening for client events
// send: true if socket sends to client
// publish: true if sockets emits publish event when receiving
config.sockets = {
  'chat': {
    'ioPath': '/chat',
    'receive': true,
    'send': true,
    'publish': true
  },
  'logs': {
    'ioPath': '/logs',
    'receive': false,
    'send': true,
    'publish': false
  },
  'devops': {
    'ioPath': '/devops',
    'receive': false,
    'send': true,
    'publish': false
  },
  'test': {
    'ioPath': '/test',
    'receive': false,
    'send': true,
    'publish': false
  },
  'health': {
    'ioPath': '/health',
    'receive': false,
    'send': true,
    'publish': false
  },
  'dimstr': {
    'ioPath': '/dimstr',
    'receive': false,
    'send': true,
    'publish': false
  }
};

config.fanoutExchanges = {
  'chat': {
    'name': 'chat',
    'durable': false,
    'subscribe': true,
    'publish': true,
    'save': false
  },
  'logs': {
    'name': 'logs',
    'durable': false,
    'subscribe': true,
    'publish': true,
    'save': true
  },
  'devops': {
    'name': 'devops',
    'durable': true,
    'subscribe': true,
    'publish': false,
    'save': true
  },
  'test': {
    'name': 'test',
    'durable': true,
    'subscribe': true,
    'publish': false,
    'save': true
  },
  'health': {
    'name': 'health',
    'durable': true,
    'subscribe': true,
    'publish': false,
    'save': true
  },
  'dimstr': {
    'name': 'dimstr',
    'durable': true,
    'subscribe': true,
    'publish': false,
    'save': true
  }
};

config.appLogExchange = 'logs';
config.healthExchange = 'health';

config.healthID = 'dashboard';
config.messagingHealthID = 'messaging';

var uuidSet = function uuidSet() {
  return {
    dashboard: uuid.v4(),
    redis: uuid.v4(),
    postgresql: uuid.v4(),
    messaging: uuid.v4()
  };
};

config.UUIDs = uuidSet();


module.exports = config;
