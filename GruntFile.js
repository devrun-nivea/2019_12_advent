/**
 * Created by pavel on 10.8.17.
 */


module.exports = function(grunt) {

    var wwwDir = 'www/';
    var templateDir = 'app/modules/advent-module/src/AdventModule/Presenters/templates/';
    var layoutFile = templateDir + '@layout.latte';
    var autoPrefixOptions = {browsers: ["last 2 versions", "Android 4.3", "ie 9", "ios_saf 6.0-7.1"]};
    var AutoPrefixPlugin = require('less-plugin-autoprefix');
    var autoPrefix = new AutoPrefixPlugin(autoPrefixOptions);
    var inlineUrlsPlugin = require('less-plugin-inline-urls');
    var groupMediaQueries = require('less-plugin-group-css-media-queries');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        shell: {
            options: {
                stderr: false
            },
            clearCache: {
                command: 'sh rmcache.sh',
                options: {
                    stdout: true,
                    stderr: true,
                    execOptions: {
                        encoding : 'utf8'
                    }
                }
            },
            projectCommands: {
                command: 'php web/www/index.php',
                options: {
                    stdout: true,
                    stderr: true,
                    execOptions: {
                        encoding : 'utf8'
                    }
                }
            },
            validateSchema: {
                command: 'php index.php orm:validate-schema'
            },
            dumpSchema: {
                command: 'php index.php orm:schema-tool:update --dump-sql'
            },
            dumpSchemaSql: {
                command: 'php index.php orm:schema-tool:update --dump-sql > saved.sql'
            },
            updateSchema: {
                command: 'php index.php orm:schema-tool:update --force'
            },
            ssh: {
                command: 'ssh -i /home/pavel/.ssh/pavel.paulik_ssh.key pavel.paulik@pixmen.cz'
            },
            tester: {
                command: 'c:/wamp/smart-up/vendor/bin/tester -c c:/wamp/bin/php/php5.5.12/php.ini module/modules/front-module/Tests/FrontModuleTests'
            },
            migrationsCreateStructure: {
                command: 'php index.php migrations:create s new'
            },
            migrationsCreateBasic: {
                command: 'php index.php migrations:create b new'
            },
            composerDumpAutoload: {
                command: 'composer dumpautoload -o'
            }
        },


        less: {
            development: {

                options: {
                    // paths: ["htdocs/design/images", "/var/www/html/smart-up/htdocs"],  // # musí být uvedena abosolutní cesta [Linux?]
                    paths: ["app/modules/advent-module/resources/public/images"],
                    // yuicompress: false,
                    optimization: 2,
                    javascriptEnabled: true,
                    sourceMap: true,
                    //sourceMapFilename: "css/index.map",
                    //sourceMapURL: 'index.map',
                    //sourceMapRootpath: 'css/',
                    sourceMapBasepath: 'resources/adventModule/css',
                    outputSourceFiles: true,
                    //sourceMapFileInline: true,
                    plugins: [
                        autoPrefix,
                        //inlineUrlsPlugin,
                        groupMediaQueries,
                        //new (require('less-plugin-clean-css'))(),
                    ],
                    globalVars: {
                        myModifiedVariable: '"../images"'
                    },
                    modifyVars: {
                        myModifiedVariable: '"../images"'
                    }

                },
                files: {
                    "app/modules/advent-module/resources/public/css/advent.css": "app/modules/advent-module/resources/src/less/index.less",
                    //"css/bootstrap.css": "src/less/bootstrap.less",
                }
            },
            production: {
                options: {
                    compress: false,
                    yuicompress: false,
                    javascriptEnabled: true,
                    // optimization: 2,
                    paths: ["app/modules/advent-module/resources/public/images"],
                    plugins: [
                        autoPrefix,
                        inlineUrlsPlugin,
                        groupMediaQueries,
                        new (require('less-plugin-clean-css'))(),
                    ],
                    modifyVars: {
                        //imgPath: '"http://mycdn.com/path/to/images"',
                        //bgColor: 'red'
                    }
                },
                files: {
                    "app/modules/advent-module/resources/public/css/advent.min.css": "app/modules/advent-module/resources/src/less/index.less",
                    // "css/index.min.css": "src/less/index.less",
                    //"css/bootstrap.min.css": "src/less/bootstrap.less",
                }
            }
        },

        modernizr: {
            dist: {
                "crawl": false,
                "parseFiles": true,
                "customTests": [],
                "devFile": "js/modernizr.js",
                "dest": "js/modernizr.js",
                "outputFile": "js/modernizr.min.js",
                "tests": [
                    "svg",
                    "cssanimations",
                    "cssfilters",
                    "cssremunit",
                    "csstransforms",
                    "csstransforms3d",
                    "csstransitions",
                    "placeholder",
                    "svgfilters",
                    "preserve3d",
                    "flexbox",
                    "touchevents"
                ],
                "options": [
                    "setClasses"
                ],
                "uglify": false
            }
        },

        useminPrepare: {
            html: [layoutFile],
            options: {dest: '.'}
        },
        netteBasePath: {
            task: {
                basePath: '.',
                options: {
                    // removeFromPath: ['app\\modules\\front-module\\src\\Presenters\\templates\\']
                    removeFromPath: [templateDir]
                }
            }
        },

        uglify: {
            options: {
                compress: {
                    global_defs: {
                        "DEBUG": false
                    },
                    dead_code: true
                }
            }
        },

        cachebreaker: {
            dev: {
                options: {
                    match: ['advent.min.js', 'main-advent.min.css']
                },
                files: {
                    src: [layoutFile]
                }
            }
        },

        browserSync: {
            dev: {
                options: {
                    //watchTask: true,
                    proxy: "http://localhost/nivea/nivea-2019-12-advent",
                    browser: ["firefox"],   // "google chrome",
                    //reloadOnRestart: false,
                    //reloadDelay: 2000,
                    //reloadDebounce: 2000
                    files: [
                        'resources/adventModule/advent.css',
                        'css/bootstrap.css',
                    //    'htdocs/css/*.css',
                        //'htdocs/js/**/*.js',
                        'app/modules/**/src/**/*.latte',
                        'app/modules/**/src/**/*.php'
                    ]
                    //server: {
                    //    baseDir: "htdocs"
                    //}
                }
            }
        },

        watch: {
            options: {
                spawn: true
            },

            less: {
        		files: ['app/modules/advent-module/resources/src/**/*.less'],  // 'www/src/less/*/*.less'
        		tasks: ['less:development' /*, 'less:production' */  ]
        	},
            final: {
        		files: ['src/**/*.less', 'js/*.js'],  // 'www/src/less/*/*.less'
        		tasks: ['less:development', 'less:production', 'useminPrepare', 'netteBasePath', 'concat', 'uglify', 'cssmin', 'cachebreaker', 'sync' ]
        	},
            javascript: {
        		files: ['js/*.js'],
        		tasks: ['cachebreaker' ]
        	}
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-nette-basepath');
    grunt.loadNpmTasks('grunt-cache-breaker');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-less');
    // grunt.loadNpmTasks("grunt-modernizr");
    grunt.loadNpmTasks('grunt-browser-sync');

    grunt.registerTask('watch-default', ['watch:less']);
    grunt.registerTask('watch-browser', ['browserSync']);
    grunt.registerTask('watch-final', ['watch:final']);

    grunt.registerTask('default', ['cachebreaker', 'less', 'useminPrepare', 'netteBasePath', 'concat', 'uglify', 'cssmin']);

};
