/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var appConfig = {
    app: 'server'
  };


  // process.env.DASHBOARD_PUBLIC_HOST - host or ip where the socket.io server resides
  // process.env.DASHBOARD_PUBLIC_PROTOCOL - protocol we're using - http or https
  // process.env.DASHBOARD_PUBLIC_PORT - port
  // When container is deployed, these environment variables need to be
  // defined. Grunt is then run to write these values to the client config file
  // These values are the protocol, host, and port that a client will use to
  // connect to the app which proxies to the Dashboard.

  // Defaults:

  var port = process.env.PORT || '3000';
  var publicHost = process.env.DASHBOARD_PUBLIC_HOST || 'localhost';
  var publicPort = process.env.DASHBOARD_PUBLIC_PORT || port;
  var publicProtocol = process.env.DASHBOARD_PUBLIC_PROTOCOL || 'http';
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
        DASHBOARD_PUBLIC_HOST: publicHost,
        DASHBOARD_PUBLIC_PORT: publicPort,
        DASHBOARD_PUBLIC_PROTOCOL: publicProtocol
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
  grunt.registerTask('hint', ['env:test', 'jshint']);
};
