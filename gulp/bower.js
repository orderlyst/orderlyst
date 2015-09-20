var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern : ['gulp-*', 'main-bower-files', 'del'],
  camelize: true
});

(function(){
  'use strict';

  gulp.task('bower-less', function () {
    return gulp.src($.mainBowerFiles())
      .pipe($.filter("**/*.less"))
      .pipe($.less())
      .pipe(gulp.dest('.tmp/'));
  });

  gulp.task('bower-sass', function () {
    return gulp.src($.mainBowerFiles())
      .pipe($.filter("**/*.scss"))
      .pipe($.sass())
      .pipe(gulp.dest('.tmp/'));
  });

  gulp.task('bower-fonts', function () {
    return gulp.src(
      [
        "bower_components/*/{font,fonts}/*",
      ]
    )
      .pipe($.flatten())
      .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
      .pipe(gulp.dest("public/assets/fonts"));
  });

  gulp.task('bower-css', function(){
    return gulp.src($.mainBowerFiles())
      .pipe($.filter('**/*.css'))
      .pipe($.flatten())
      .pipe(gulp.dest('.tmp'));
  });

  gulp.task('bower-stylesheets', ['bower-less', 'bower-sass', 'bower-css'], function () {
    return gulp.src(
      [
        ".tmp/*.css"
      ]
    )
      .pipe($.concat('vendor.css'))
      .pipe($.replace('../font/', '../fonts/'))
      .pipe($.minifyCss({
        processImport: false
      }))
      .pipe(gulp.dest("public/assets/css"));
  });

  gulp.task('bower-js', function() {
    var jsFilter = $.filter('**/*.js');
    return gulp.src($.mainBowerFiles())
      .pipe(jsFilter)
      .pipe($.concat('vendor.js'))
      //.pipe($.uglify())
      .pipe(gulp.dest('public/assets/scripts'));
  });

  gulp.task('bower', ['bower-js', 'bower-stylesheets', 'bower-fonts']);

})();
