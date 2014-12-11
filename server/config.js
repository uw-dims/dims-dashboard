var config = {};

config.sslOn = process.env.SSL_ON || true;

config.port = process.env.PORT || 3200;

config.sslport = process.env.SSL_PORT || 3030;

config.log_level = process.env.LOG_LEVEL || 'debug';

config.log_dir = process.env.LOG_PATH || 'logs/';

config.cert_dir = process.env.CERT_DIRECTORY || '/opt/dims/certs/';

config.ca_name = process.env.CA_NAME || 'dims-ca';

config.cert_name = process.env.CERT_NAME || process.env.HOSTNAME || 'localhost';

config.redisHost = process.env.REDIS_HOST || 'localhost';

config.redisDatabase = process.env.REDIS_DATABASE || 0;

config.sessionTTL = 7200; //Redis session expiration. 2 hours, in seconds

config.sessionSecret = '3xueis763$%STID47373deC!!QUsT8J4$';

config.cookieSecret = 'Xu9J35bq!5#kNY*n3v04aSPxoURx98wQZW';

config.passSecret = '84jd$#lk903jcy2AUEI2j4nsKLJ!lIY'

config.bin = '/opt/dims/bin/';

config.rpcPath = '/opt/dims/src/prisem/rpc'

config.rpcServer = 'rabbitmq.prisem.washington.edu';

config.rpcUser = 'rpc_user';

config.rpcPass = 'rpcm3pwd';

config.rpcPort = '5672';

config.mapfile = '/etc/ipgrep_networks.txt';

config.inputdir = '/opt/dims/srv/input';

config.outputdir = '/opt/dims/srv/output';

config.data = '/opt/dims/data/sample-data/'

config.serverPath = __dirname;

config.userDataPath =  config.serverPath + '/mydata/';

config.demoDatastorePath = config.serverPath + '/data/';

config.directoryMapping = {
  'ip_lists': config.userDataPath+'ipFiles/',
  'map_files': config.userDataPath+'mapFiles/',
  'data_files': config.userDataPath+'dataFiles/'
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
    "anonymize": "false",
    "rpcDebug": "true",
    "rpcVerbose": "true",
    "cifbulkQueue": "cifbulk_v1"
};

// config.keyPrefixes = {
//   'userSettings': 'userSetting'
// };

config.maxUploadFileNum = 10;
config.maxUploadFileSize = 39273942;

config.server_key = config.cert_dir + config.cert_name + '.key';
config.server_crt = config.cert_dir + config.cert_name + '.crt';
config.server_ca = config.cert_dir + config.ca_name + '.crt';

module.exports = config;