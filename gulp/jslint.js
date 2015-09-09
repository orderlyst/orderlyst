var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern : ['gulp-*', 'main-bower-files', 'del'],
  camelize: true
});

(function(){
  "use strict";

  gulp.task('jslint', function(){
    return gulp.src(
        [
          "!./node_modules/**",
          "!./bower_components/**",
          "!./public/**",
          "**/*.js"
        ]
      )
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'));
  });
})();
