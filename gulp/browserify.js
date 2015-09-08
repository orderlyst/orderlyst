
var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');

(function(){
  'use strict';

  var file = 'main.js';

  // add custom browserify options here
  var customOpts = {
    entries: ['./src/index.js'],
    debug: true
  };
  var bundler = browserify({
        entries     : ['assets/js/main.js'],
        debug       : true,
        cache       : {},
        packageCache: {},
        fullPaths   : true
      }, watchify.args);

  var handleErrors = function() {

  };

  // add transformations here
  // i.e. b.transform(coffeeify);
  var rebundle = function() {
    return bundler.bundle()
      // log errors if they happen
      .on('error', handleErrors)
      .pipe(source('main.js'))
      // optional, remove if you don't need to buffer file contents
      .pipe(buffer())
      // optional, remove if you dont want sourcemaps
      .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
         // Add transformation tasks to the pipeline here.
      .pipe(sourcemaps.write('./')) // writes .map file
      .pipe(gulp.dest('public/scripts'));
  };

  gulp.task('browserify', rebundle); // so you can run `gulp js` to build the file
  if (process.env.NODE_ENV == 'development') {
    bundler = watchify(bundler);
    bundler.on('update', rebundle); // on any dep update, runs the bundler
  }

})();
