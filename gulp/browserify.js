
var watchify = require('watchify');
var $ = require('gulp-load-plugins')({
  pattern : ['gulp-*', 'main-bower-files', 'del'],
  camelize: true
});
var browserify = require('browserify');
var gulp = require('gulp');
var util = require('gulp-util');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var debowerify = require('debowerify');

(function(){
  'use strict';

  var bundler = browserify(
    {
      entries     : ['assets/scripts/main.js'],
      debug       : true,
      cache       : {},
      packageCache: {},
      fullPaths   : true
    },
    watchify.args
  );

  var transforms = [
    debowerify,
    'brfs'
  ];

  var handleErrors = function(error) {
    $.notify.onError({
      title  : 'Browserify Bundle Error',
      message: error
    });
    console.log(error);
    this.emit('end');
  };

  // add transformations here
  // i.e. b.transform(coffeeify);
  var rebundle = function() {
    console.log('Rebundling...');

    transforms.forEach(function (transform) {
      bundler.transform(transform);
    });

    return bundler.bundle()
      // log errors if they happen
      .on('error', handleErrors)
      .pipe(source('main.js'))
      // optional, remove if you don't need to buffer file contents
      .pipe(buffer())
      // optional, remove if you dont want sourcemaps
//      .pipe($.sourcemaps.init({})) // loads map from browserify file
         // Add transformation tasks to the pipeline here.
      .pipe($.streamify(process.env.NODE_ENV == 'production' ? $.uglify({
        compress: {drop_console: true}
      }) : util.noop() ))
//      .pipe($.sourcemaps.write('./')) // writes .map file
      .pipe(gulp.dest('public/assets/scripts'));
  };

  gulp.task('browserify', rebundle); // so you can run `gulp js` to build the file
  if (process.env.NODE_ENV == 'development') {
    bundler = watchify(bundler);
    bundler.on('update', rebundle); // on any dep update, runs the bundler
  }

})();
