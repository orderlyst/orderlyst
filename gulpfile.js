var gulp = require('gulp');

(function(){
  'use strict';

  require('require-dir')('./gulp/');

  global.isProduction = process.env.NODE_ENV === 'production' || false;

  gulp.task('default', ['pre-clean'], function(){
    gulp.start('build');
  });
})();
