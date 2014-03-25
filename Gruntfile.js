module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            dist:['dist']
        },
        karma: {
            dist:{
                configFile: 'config/karma.conf.js',
                singleRun: true
            },
            dev: {
                configFile: 'config/karma.conf.js'
            }
        },
        jshint: {
            files: [
                'src/**/*.js',
                'test/**/*.js'
            ],
            options: {
                globals: {
                    angular: true
                }
            }
        },
        jscs: {
            src: '<%= jshint.files %>',
            options: {
                "requireSpacesInAnonymousFunctionExpression": {
                    "beforeOpeningRoundBrace": true,
                    "beforeOpeningCurlyBrace": true
                },
                "requireSpacesInNamedFunctionExpression": {
                    "beforeOpeningCurlyBrace": true
                },
                "requireCurlyBraces": [
                    "if",
                    "else",
                    "for",
                    "while",
                    "do",
                    "try",
                    "catch"
                ],
                "requireSpaceAfterKeywords": [
                    "if",
                    "else",
                    "for",
                    "while",
                    "do",
                    "switch",
                    "return",
                    "try",
                    "catch"
                ]
            }
        },
        uglify: {
            dist: {
                files: {
                    'dist/angular-mock-rest.min.js': 'src/angular-mock-rest.js'
                },
                options: {
                    banner: '/*! angular-mock-rest */\n'
                }
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('dist', ['jshint', 'jscs', 'karma:dist', 'clean:dist', 'uglify:dist']);
    grunt.registerTask('test', ['karma:dev']);
};