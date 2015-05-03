module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    force: true,
    // Task configuration.
    jshint: {
      all: {
        src: [
          '**/*.js',
          '!node_modules/**'
        ],
        options: {
          jshintrc: true
        }
      }
    },
    jscs: {
      src: [
        '**/*.js',
        '!node_modules/**'
      ],
      options: {
        config: '.jscsrc'
      }
    },
    concurrent: {
      options: {
        logConcurrentOutput: false
      },
      lint: ['jshint', 'jscs']
    }
  });

  // These plugins provide necessary tasks.
  require('matchdep')
    .filterAll(['grunt-*'])
    .forEach(grunt.loadNpmTasks);

  // syntax and code styles
  grunt.registerTask('lint', ['concurrent:lint']);

  // `$ grunt lint`
  grunt.registerTask('default', ['lint']);
};
