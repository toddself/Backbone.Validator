module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
          'Gruntfile.js',
          'backbone.validator.js',
          'test/**/*.js'
      ]
    },
    jsvalidate: {
      files: '<%=jshint.all%>'
    },
    mocha: {
      index: ['test/index.html'],
      options: {
        log: true,
        run: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-jsvalidate');

  grunt.registerTask('default', ['jsvalidate', 'jshint', 'mocha']);
};
