module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            dist:['dist']
        },
        karma: {
            src:{
                configFile: 'config/karma.conf.js',
                singleRun: true
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
                    'dist/angular-local-storage.min.js': 'src/angular-mock-rest.js'
                },
                options: {
                    banner: '/*! angular-local-storage */\n'
                }
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('dist', ['jshint', 'jscs', 'karma:src', 'clean:dist', 'uglify:dist']);
    grunt.registerTask('test', ['karma:src']);
};