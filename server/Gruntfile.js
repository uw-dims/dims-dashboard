'use strict';

module.exports = function(grunt) {
  
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var appConfig = {
    app: 'server'
  };

  var node_env = grunt.option('node_env') || 'development';
  var log_level = grunt.option('log_level') || 'debug';
  var cert_directory = grunt.option('cert_directory') || 'certs/';
  var cert_name = grunt.option('cert_name') || 'localhost';
  var ssl_port = grunt.option('ssl_port') || '3030';

  grunt.initConfig({
    appConfig: appConfig,
    env: {
      test: {
        NODE_ENV: node_env,
        LOG_LEVEL: log_level,
        CERT_DIRECTORY: cert_directory,
        CERT_NAME: cert_name,
        SSL_PORT: ssl_port
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/spec/specHelper.js','test/**/*.js']
      }
    }
  });
  grunt.registerTask('default', ['env:test','mochaTest']);
};