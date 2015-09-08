var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern : ['gulp-*', 'del'],
  camelize: true
});

(function(){
  "use strict";

  gulp.task('pre-clean', function (done) {
    $.del(['public/assets/', '.tmp/'], done);
  });

  // Deletes any temporary files after a build
  gulp.task('post-clean', function (done) {
    $.del(['.tmp/'], done);
  });

  gulp.task('images', function () {
    gulp.src('assets/images/**/*.{jpg,png,gif}')
      .pipe(gulp.dest('public/assets/images/'))
      .pipe($.notify({'message': 'Images are loaded.', onLast: true}));
    gulp.src("assets/favicon.ico")
      .pipe(gulp.dest('public/'));
  });

  gulp.task('misc', function () {
    gulp.src("assets/robots.txt")
      .pipe(gulp.dest('public/'));
  });

  gulp.task('sass', function () {
    gulp.src('assets/sass/**/*.scss')
      .pipe($.sass().on('error', $.sass.logError))
      .pipe($.minifyCss({
        processImport: false
      }))
      .pipe($.concat('style.css'))
      .pipe(gulp.dest('public/assets/css/'))
      .pipe($.notify({'message': 'Sass compilation complete.', onLast: true}));
  });

  gulp.task('scripts', function () {
    gulp.src('assets/scripts/**/*.js')
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'))
      .pipe($.uglify())
      .pipe(gulp.dest('public/assets/scripts/'))
      .pipe($.notify({'message': 'JavaScripts are loaded.', onLast: true}));
  });

  gulp.task('build', ['sass', 'scripts', 'images', 'bower', 'misc', 'browserify', 'jslint'], function () {
    gulp.start('post-clean');

    if(!isProduction){
      gulp.watch('./assets/**/*.{jpg|png|gif|ico}', ['images']);
      gulp.watch('./assets/**/*.scss', ['sass']);
      gulp.watch('./assets/**/*.js', ['scripts']);
      gulp.watch('**/*.js', ['app-lint']);
    }
  });

})();
