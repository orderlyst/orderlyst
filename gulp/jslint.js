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
          "**/*.js",
          "!./node_modules/**",
          "!./bower_components/**",
          "!./public/**"
        ]
      )
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'));
  });
})();
