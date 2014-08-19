var config = {};

config.port = process.env.PORT || 3200;

config.sslport = 3030;

config.log_level = process.env.LOG_LEVEL || 'debug'

config.bin = '/opt/dims/bin';

config.server = 'rabbitmq.prisem.washington.edu';

config.mapfile = '/etc/ipgrep_networks.txt';

config.inputdir = '/opt/dims/srv/input';

config.outputdir = '/opt/dims/srv/output';

config.data = '../../data/sample-data/'

config.userDataDir = './mydata/'

config.directoryMapping = {
  'ip_lists': config.userDataDir+'ipFiles/',
  'map_files': config.userDataDir+'mapFiles/',
  'data_files': config.userDataDir+'dataFiles/'
};

config.defaultMapping = {
	'default_data': config.data
};

config.server_key = './cert/server.key';
config.server_crt = './cert/server.crt';
config.server_ca = './cert/ca.crt';

module.exports = config;