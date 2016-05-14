'use strict';

var gulp = require('gulp'),
    qunit = require('gulp-qunit'),
    size = require('gulp-size'),
    through = require('through2'),
    nglob = require('glob'),
    jsSource = './src/**/*.js',

    // fs = require('fs'),
    path = require('path');

gulp.task('test', (done) => {
  gulp.src('./src/htmltests/QunitTest.html')
      .pipe(qunit())
});

/////////////// Everything Below is Experimental ///////////////

gulp.task('build', () => {
  gulp.src(source)
});

gulp.task('test-watch', () => {
  gulp.watch(source , ['test'] );
});

gulp.task('zet', () => {
  // gulp.src(jsSource)
  gulp.src(['./src/glift.js', './src/**/*.js', '!./src/**/*test.js'])
    .pipe(through.obj((file, enc, cb) => {
      console.log(file.path);
      cb()
    }))
    // .pipe(size())
    // .pupe(through2.obj((data) => {
      // // console.log(data);
    // })
    // .pipe(through2.obj((data) => {
      // // console.log(data);
    // });
})

gulp.task('srclist', () => {
  var dirIgnore = /.*(htmltests|libs).*/;
  var f = nglob.sync('src/**/');
  var out = ['src/glift.js']
  f.forEach((dir) => {
    if (dirIgnore.test(dir)) {
      // Ignore the directories.
    } else {
      var lastComponent
      out.push(dir
          + dir.substring(0, dir.length-1) + '.js');
      out.push(dir + '*.js')
      console.log(dir);
    }
  })
  console.log(out);
  // , {}, function(files) {
    // console.log(files);
  // })
});

