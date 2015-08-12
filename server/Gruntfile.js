'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var appConfig = {
    app: 'server'
  };

  // var node_env = grunt.option('node_env') || 'test';
  // var log_level = grunt.option('log_level') || 'debug';
  // var certDirectory = grunt.option('certDirectory') || 'certs/';
  // var certName = grunt.option('certName') || 'localhost';
  // var sslPort = grunt.option('sslPort') || '3030';

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
  var certDirectory = process.env.CERT_DIRECTORY || '/etc/ssl/certs/';
  var certName = process.env.CERT_NAME || 'localhost';
  var sslPort = process.env.SSL_PORT || '3030';
  var sslOn = process.env.SSL_ON || false;


  grunt.initConfig({
    appConfig: appConfig,
    env: {
      test: {
        NODE_ENV: nodeEnv,
        LOG_LEVEL: logLevel,
        CERT_DIRECTORY: certDirectory,
        CERT_NAME: certName,
        SSL_PORT: sslPort,
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
      files: ['tests/**/*.js']
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish'),
        force: true
      },
      all: {
        src: [
          '{services,models,utils,routes,config}/{,*/}*.js'
        ]
      }
    }
  });
  grunt.registerTask('default', ['env:test', 'jshint', 'tape']);
  grunt.registerTask('test', ['env:test', 'tape']);
};
