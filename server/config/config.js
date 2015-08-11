var config = {};

config.sslOn = process.env.SSL_ON || false;

config.port = process.env.PORT || 3000;

config.sslport = process.env.SSL_PORT || 3030;

config.env = process.env.NODE_ENV || 'development';

config.logLevel = process.env.LOG_LEVEL || 'debug';

config.logDir = process.env.LOG_PATH || '/data/dashboard/logs/';

config.logfile = config.log_dir + 'dashboard.log';

// Default is Ubuntu cert location
config.certDir = process.env.CERT_DIRECTORY || '/etc/ssl/certs/';

config.caName = process.env.CA_NAME || 'dims-ca';

config.certName = process.env.CERT_NAME || process.env.PUBLICHOST || 'localhost';

config.redisHost = process.env.REDIS_HOST || 'localhost';

config.redisPort = process.env.REDIS_PORT || 6379;

config.redisDatabase = process.env.REDIS_DATABASE || 0;

// Need to set these variables if using a real ops-trust db
// User would be...
config.userDBHost = process.env.USER_DB_HOST || 'localhost';
config.userDBUser = process.env.USER_DB_USER || 'dims';
config.userDatabase = process.env.USER_DATABASE || 'ops-trust';

// During development - specify user backend.
// Possible values:
//   'postgresql' - use postgresql database
//   'static'  - use static config variable with users/passwords - only for
//       development/testing
//   others... tba
config.POSTGRESQL = 'postgresql';
config.STATIC = 'static';

// Set environment USER_BACKEND to 'static' to use test users for testing
// rather than a postgres instance
// Default is Postgresqll
config.userSource = process.env.USER_BACKEND || config.POSTGRESQL;

// Put this here for now - only for testing
config.testUsers =
  [
    {
      'ident': 'dittrich',
      'desc': 'David Dittrich',
      'password': 'dittrich'
    }, {
      'ident': 'lparsons',
      'desc': 'Linda Parsons',
      'password': 'lparsons'
    }, {
      'ident': 'eliot',
      'desc': 'Eliot Lim',
      'password': 'eliot'
    }, {
      'ident': 'stuart',
      'desc': 'Stuart Maclean',
      'password': 'stuart'
    }, {
      'ident': 'parksj',
      'desc': 'Jeremy Parks',
      'password': 'parksj'
    }, {
      'ident': 'mboggess',
      'desc': 'Megan Boggess',
      'password': 'mboggess'
    }, {
      'ident': 'andclay',
      'desc': 'Anderson Nascimento',
      'password': 'andclay'
    }, {
      'ident': 'testuser',
      'desc': 'Test User',
      'password': 'testuser'
    }
  ];

config.sessionTTL = 7200; //Redis session expiration. 2 hours, in seconds

config.sessionSecret = '3xueis763$%STID47373deC!!QUsT8J4$';

config.cookieSecret = 'Xu9J35bq!5#kNY*n3v04aSPxoURx98wQZW';

config.passSecret = '84jd$#lk903jcy2AUEI2j4nsKLJ!lIY';

config.bin = '/opt/dims/bin/';

config.dimsenvbin = '/opt/dims/envs/dimsenv/bin';

config.rpcbin = config.dimsenvbin;

config.rpcPath = '/opt/dims/src/prisem/rpc';

config.rpcServer = process.env.RABBIT_SERVER || 'rabbitmq.prisem.washington.edu';

config.rpcUser = process.env.RABBIT_USER || 'rpc_user';

config.rpcPass = process.env.RABBIT_PASS || 'rpcm3pwd';

config.rpcPort = process.env.RABBIT_PORT  || '5672';

config.mapfile = '/etc/ipgrep_networks.txt';

// not used
//config.inputdir = '/opt/dims/srv/input';
// not used
//config.outputdir = '/opt/dims/srv/output';

config.data = '/opt/dims/data/dims-sample-data';

config.serverPath = __dirname;

//config.userDataPath =  config.serverPath + '/mydata/';

//config.demoDatastorePath = config.serverPath + '/data/';


// /opt/dims/data in the Dashboard container will map to host
// /data/dashboard
config.userDataPath = '/opt/dims/data/dashboard/';
config.demoDatastorePath = '/opt/dims/data/dashboard/data/';
config.uploadPath = '/data/dashboard/upload/';

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
  'cifbulkQueue': 'cifbulk_v1'
};

config.defaultRedisTypes = {
  'hash': 'hash',
  'string': 'string',
  'set': 'set',
  'sortedSet': 'sortedSet'
};

// config.keyPrefixes = {
//   'userSettings': 'userSetting'
// };

config.maxUploadFileNum = 10;
config.maxUploadFileSize = 39273942;

config.serverKey = config.certDir + config.certName + '.key';
config.serverCrt = config.certDir + config.certName + '.crt';
config.serverCa = config.certDir + config.caName + '.crt';

module.exports = config;
