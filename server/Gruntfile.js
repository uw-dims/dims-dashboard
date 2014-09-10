'use strict';

module.exports = function(grunt) {
  
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var appConfig = {
    app: 'server'
  };

  grunt.initConfig({
    appConfig: appConfig,

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/spec/specHelper.js','test/**/*.js']
      }
    }
  });

  grunt.registerTask('default', 'mochaTest');
};