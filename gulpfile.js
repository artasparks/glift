'use strict';

var gulp = require('gulp'),
    qunit = require('gulp-qunit');

gulp.task('test', function() {
  return gulp.src('./src/htmltests/QunitTest.html')
      .pipe(qunit());
});
