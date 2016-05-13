'use strict';

var gulp = require('gulp'),
    qunit = require('gulp-qunit'),
    jshint = require('gulp-jshint'),
    source = './src/**/*.js';


gulp.task('test', () => {
  return gulp.src('./src/htmltests/QunitTest.html')
      .pipe(qunit());
});

gulp.task('build', () => {
  return gulp.src(source)
    .pipe(jshint());
});

gulp.task('test-watch', () => {
  gulp.watch(source , ['test'] );
});

