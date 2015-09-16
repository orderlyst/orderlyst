var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern : ['gulp-*', 'del'],
  camelize: true
});

var bootstrapDir = './bower_components/bootstrap-sass';

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
    return gulp.src('assets/images/**/*.{jpg,png,gif}')
      .pipe(gulp.dest('public/assets/images/'))
      .pipe($.notify({'message': 'Images are loaded.', onLast: true}));
  });

  gulp.task('misc', function () {
    return gulp.src([
        "assets/robots.txt",
        "assets/favicon.ico"
      ])
      .pipe(gulp.dest('public/'));
  });

  gulp.task('sass', function () {
    return gulp.src('assets/sass/**/*.scss')
      .pipe($.sass({
        includePaths: [bootstrapDir + '/assets/stylesheets']
      }).on('error', $.sass.logError))
      .pipe($.minifyCss({
        processImport: false
      }))
      .pipe($.concat('style.css'))
      .pipe(gulp.dest('public/assets/css/'))
      .pipe($.notify({'message': 'Sass compilation complete.', onLast: true}));
  });

  gulp.task('scripts', function () {
    return gulp.src('assets/scripts/**/*.js')
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'))
      //.pipe($.uglify())
      .pipe(gulp.dest('public/assets/scripts/'))
      .pipe($.notify({'message': 'JavaScripts are loaded.', onLast: true}));
  });

  gulp.task('build', ['sass', 'scripts', 'images', 'bower', 'misc', 'browserify', 'jslint'], function () {
    gulp.start('post-clean');

    if(process.env.NODE_ENV === 'development'){
      gulp.watch('./assets/images/**/*.{jpg|png|gif}', ['images']);
      gulp.watch('./assets/sass/**/*.scss', ['sass']);
      gulp.watch('./assets/scripts/**/*.js', ['scripts']);
    }
  });

})();
