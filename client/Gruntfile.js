'use strict';

var _ = require('lodash-compat');

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'dimswebapp',
    dist: '../public',
    tmp: '../.tmp/'
  };

  // Defaults:
  // ENV vars are specified for the server in /etc/dashboard/dashboard.conf. They can also
  // be provided on the command line if running manually. 
  // These are the
  // server ENV vars which are needed by the client as well as the server
  var publicHost = process.env.DASHBOARD_PUBLIC_HOST || 'localhost';
  var publicPort = process.env.DASHBOARD_PUBLIC_PORT || '80';
  var publicProtocol = process.env.DASHBOARD_PUBLIC_PROTOCOL || 'http';
  var dashboardNodeEnv = process.env.DASHBOARD_NODE_ENV || 'development';
  var consulUrl = process.env.CONSUL_URL;
  var tridentUrl = process.env.TRIDENT_URL;

  // The client configuration json needs to be located at /etc/dashboard/dashboard_client_config.json
  var clientConfig = grunt.file.readJSON('/etc/dashboard/dashboard_client_config.json');

  // modify the client config to add consul, trident URLs if they are provided and if
  // the config is set up to contain them
  function setExternalsConfig(config, type, url) {
    var index = _.findIndex(config.siteExternals, function (obj) {
      return obj.externalKey === type;
    });
    if (index !== -1) {
      if (url) {
        config.siteExternals[index].siteURL = url;
      } else {
        // Delete type from the config since no URL provided
        _.pullAt(config.siteExternals, index);
      }
    }
    return config;
  }

  // Update clientConfig with URL for consul and trident (if they are available on this system)
  clientConfig = setExternalsConfig(clientConfig, 'consul', consulUrl);
  clientConfig = setExternalsConfig(clientConfig, 'trident', tridentUrl);
  clientConfig.siteIntroText = _.escape(clientConfig.siteIntroText);

  // Copy the site logo to images directory before building:
  if (grunt.file.exists('/etc/dashboard/' + clientConfig.siteLogo)) {
    grunt.file.copy('/etc/dashboard/' + clientConfig.siteLogo, './dashboard/images/default/' + clientConfig.siteLogo);
  }
  // Copy favicon if it exists
  if (grunt.file.exists('/etc/dashboard/favicon.ico')) {
    grunt.file.copy('/etc/dashboard/favicon.ico', './dashboard/images/default/favicon.ico');
  }

  console.log('Grunt build with publicHost=' + publicHost + ', publicPort=' + publicPort + ', publicProtocol=' + publicProtocol);
  // Define the configuration for all the tasks
  grunt.initConfig({
    appConfig: appConfig,
    // Watches files for changes and runs tasks based on the changed files
    ngconstant: {
      options: {
        space: '  ',
        wrap: '\'use strict\';\n\n {%= __ngModule %}\n\n',
        name: 'dimsDashboard.config',
        deps: false,
        dest: '<%= appConfig.app %>/scripts/config.js',

        // Set up environment vars to be available to the client
        constants: {
          ENV: {
            DASHBOARD_PUBLIC_HOST: publicHost,
            DASHBOARD_PUBLIC_PORT: publicPort,
            DASHBOARD_PUBLIC_PROTOCOL: publicProtocol,
            DASHBOARD_NODE_ENV: dashboardNodeEnv          },
          siteVars: clientConfig,
          client_package: grunt.file.readJSON('package.json'),
          server_package: grunt.file.readJSON('../server/package.json')
        }
      },
      build: {
      }
    },

    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= appConfig.app %>/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      less: {
        files: ['<%= appConfig.app %>/styles/{,*/}*.less'],
        tasks: ['less:production', 'less:development', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= appConfig.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= appConfig.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings for live reload during development. 
    // We are not currently using this, so it has
    // not been tested.
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= appConfig.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish'),
        force: true
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= appConfig.app %>/scripts/{,*/}*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      options: {
        force: true
      },
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= appConfig.dist %>/{,*/}*',
           '!<%= appConfig.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      options: {
        cwd: '<%= appConfig.app %>'
      },
      app: {
        src: ['<%= appConfig.app %>/index.html'],
        exclude: ['bower_components/bootstrap/dist/js/bootstrap.js', 'bower_components/cryptojslib']
        //ignorePath:  /\.\.\//
      },
      less: {
        //src: ['<%= appConfig.app %>/styles/style.less'],
        src: ['<%= appConfig.app %>/styles/themes/*.less'],
        exclude: ['bower_components/bootstrap/dist/css/bootstrap.css']
        //ignorePath:  /\.\.\//
        //ignorePath: /(\.\.\/){1,2}bower_components\//
      }
    },

    // Compiles LESS to CSS and generates necessary files if requested
    // Override the variable for the site logo
    less: {
      options: {
        modifyVars: {
          siteLogoFile: clientConfig.siteLogo
        }
      },
      development: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          paths: ['<%= appConfig.app %>/styles']

        },
        files: {
          //'.tmp/styles/style.css': '<%= appConfig.app %>/styles/style.less',
          '.tmp/styles/light.css': '<%= appConfig.app %>/styles/themes/light.less',
          '.tmp/styles/dark.css': '<%= appConfig.app %>/styles/themes/dark.less'
        }
      },

      production: {
        options: {
          paths: ['<%= appConfig.app %>/styles']
        },
        files: {
          //'<%= appConfig.app %>/styles/style.css': '<%= appConfig.app %>/styles/style.less'
          '<%= appConfig.app %>/styles/light.css': '<%= appConfig.app %>/styles/themes/light.less',
          '<%= appConfig.app %>/styles/dark.css': '<%= appConfig.app %>/styles/themes/dark.less'
        }
      }

    },


    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= appConfig.dist %>/scripts/{,*/}*.js',
          '<%= appConfig.dist %>/styles/{,*/}*.css',
          '<%= appConfig.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= appConfig.dist %>/styles/fonts/*'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= appConfig.app %>/index.html',
      options: {
        dest: '<%= appConfig.dist %>',
        flow: {
          html: {
            steps: {
              // uglifying not working, so disabling it for now
              // js: ['concat', 'uglifyjs'],
              js: ['concat'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%= appConfig.dist %>/{,*/}*.html'],
      css: ['<%= appConfig.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= appConfig.dist %>', '<%= appConfig.dist %>/images']
      }
    },

    // The following *-min tasks will produce minified files in the dist folder
    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= appConfig.dist %>/styles/*.css': [
    //         '.tmp/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    uglify: {
      options: {
        mangle: false
      },
      dist: {
        files: {
          '<%= appConfig.dist %>/scripts/scripts.js': [
            '<%= appConfig.dist %>/scripts/scripts.js'
          ],
          '<%= appConfig.dist %>/scripts/vendor.js': [
            '<%= appConfig.dist %>/scripts/vendor.js']
        }
      }
    },
    concat: {
      dist: {}
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= appConfig.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= appConfig.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= appConfig.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= appConfig.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= appConfig.dist %>',
          src: ['*.html', 'views/{,*/}*.html'],
          dest: '<%= appConfig.dist %>'
        }]
      }
    },

    // ngAnnotate tries to make the code safe for minification automatically by
    // using the Angular long form for dependency injection. It doesn't work on
    // things like resolve or inject so those have to be done manually.
    ngAnnotate: {
      dist: {
        // files: [{
        //   expand: true,
        //   cwd: '<%= appConfig.app %>/scripts',
        //   src: '{,*/}*.js',
        //   dest: '.tmp/concat/scripts'
        // }]
        files: [{
          expand: true,
          // cwd: '<%= appConfig.dist %>',
          src: '<%= appConfig.dist %>/scripts/scripts.js',
          dest: 'scripts.js'
        }]
      }
    },

    // // Replace Google CDN references
    // cdnify: {
    //   dist: {
    //     html: ['<%= appConfig.dist %>/*.html']
    //   }
    // },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= appConfig.app %>',
          dest: '<%= appConfig.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'views/{,*/}*.html',
            'images/{,*/}*',
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= appConfig.dist %>/images',
          src: ['generated/*']
        }, {
          expand: true,
          cwd: '.',
          src: 'bower_components/bootstrap-sass-official/assets/fonts/bootstrap/*',
          dest: '<%= appConfig.dist %>'
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= appConfig.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // // Run some tasks in parallel to speed up the build process
    // concurrent: {
    //   server: [
    //     'compass:server'
    //   ],
    //   test: [
    //     'compass'
    //   ],
    //   dist: [
    //     'compass:dist',
    //     'imagemin',
    //     'svgmin'
    //   ]
    // },

    // Test settings
    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    }
  });

  grunt.registerTask('configure', 'Create the configuration file', function (target) {
    grunt.task.run([
      'ngconstant'
      ]);
  });

  grunt.registerTask('dev-compile', 'Create the config file and compile LESS', function (target) {
    grunt.task.run([
      'ngconstant',
      'wiredep',
      'less'
      ]);
  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'ngconstant',
      'wiredep',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'ngconstant',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'ngconstant',
    'wiredep',
    'less',
    'useminPrepare',
    'autoprefixer',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'cssmin',
    // Uglify not working on some of our dependencies
    'uglify',
    //'filerev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
