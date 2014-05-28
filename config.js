var config = {};

config.port = process.env.PORT || 3200;

config.log_level = process.env.LOG_LEVEL || 'debug'

config.bin = '/opt/dims/bin';

config.server = 'rabbitmq.prisem.washington.edu';

config.mapfile = '/etc/ipgrep_networks.txt';

config.inputdir = '/opt/dims/srv/input';

config.outputdir = '/opt/dims/srv/output';

module.exports = config;