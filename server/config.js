var config = {};

config.sslOn = process.env.SSL_ON || true;

config.port = process.env.PORT || 3200;

config.sslport = process.env.SSL_PORT || 3030;

config.log_level = process.env.LOG_LEVEL || 'debug';

config.log_dir = process.env.LOG_PATH || 'logs/';

config.cert_dir = process.env.CERT_DIRECTORY || 'certs/';

config.ca_name = process.env.CA_NAME || 'dims-ca';

config.cert_name = process.env.CERT_NAME || 'localhost';

config.bin = '/opt/dims/bin/';

config.rpcServer = 'rabbitmq.prisem.washington.edu';

config.mapfile = '/etc/ipgrep_networks.txt';

config.inputdir = '/opt/dims/srv/input';

config.outputdir = '/opt/dims/srv/output';

config.data = '../../../data/sample-data/'

config.userDataDir = './mydata/'

config.directoryMapping = {
  'ip_lists': config.userDataDir+'ipFiles/',
  'map_files': config.userDataDir+'mapFiles/',
  'data_files': config.userDataDir+'dataFiles/'
};

config.defaultMapping = {
	'default_data': config.data
};

config.maxUploadFileNum = 10;
config.maxUploadFileSize = 39273942;

config.server_key = config.cert_dir + config.cert_name + '.key';
config.server_crt = config.cert_dir + config.cert_name + '.crt';
config.server_ca = config.cert_dir + config.ca_name + '.crt';

module.exports = config;