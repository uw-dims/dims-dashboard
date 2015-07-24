'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var appConfig = {
    app: 'server'
  };

  // var node_env = grunt.option('node_env') || 'test';
  // var log_level = grunt.option('log_level') || 'debug';
  // var cert_directory = grunt.option('cert_directory') || 'certs/';
  // var cert_name = grunt.option('cert_name') || 'localhost';
  // var ssl_port = grunt.option('ssl_port') || '3030';

  // process.env.PUBLICHOST - host or ip where the socket.io server resides
  // process.env.PUBLICPROTOCOL - protocol we're using - http or https
  // process.env.PUBLICPORT - port
  // When container is deployed, these environment variables need to be
  // defined. Grunt is then run to write these values to the client config file
  // These values are the protocol, host, and port that a client will use to
  // connect to the app which proxies to the Dashboard.

  // Defaults:

  var port = process.env.PORT || '3000';
  var publicHost = process.env.PUBLICHOST || 'localhost';
  var publicPort = process.env.PUBLICPORT || port;
  var publicProtocol = process.env.PUBLICPROTOCOL || 'http';
  var nodeEnv = process.env.NODE_ENV || 'test';
  var logLevel = process.env.LOG_LEVEL || 'debug';
  var cert_directory = process.env.CERT_DIRECTORY || '/etc/ssl/certs/';
  var cert_name = process.env.CERT_NAME || 'localhost';
  var ssl_port = process.env.SSL_PORT || '3030';
  var ssl_on = process.env.SSL_ON || false;


  grunt.initConfig({
    appConfig: appConfig,
    env: {
      test: {
        NODE_ENV: nodeEnv,
        LOG_LEVEL: logLevel,
        CERT_DIRECTORY: cert_directory,
        CERT_NAME: cert_name,
        SSL_PORT: ssl_port,
        PUBLICHOST: publicHost,
        PUBLICPORT: publicPort,
        PUBLICPROTOCOL: publicProtocol
      }
    },

    // mochaTest: {
    //   test: {
    //     options: {
    //       reporter: 'spec'
    //     },
    //     src: ['test/spec/specHelper.js','test/**/*.js']
    //   }
    // },

    tape: {
      options: {
        pretty: false,
        output: 'console'
      },
      files: ['test/**/*.js']
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish'),
        force: true
      },
      all: {
        src: [
          'services/{,*/}*.js'
        ]
      }
    },
  });
  grunt.registerTask('default', ['env:test', 'jshint', 'tape']);
  grunt.registerTask('test', ['env:test', 'tape']);
};
