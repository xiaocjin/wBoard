module.exports = function(grunt) {

  grunt.initConfig({
    uglify: {
      build: {
        src: ['public/javascript/*.js'],
        dest: 'public/javascript/*.min.js'
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['uglify']);
};