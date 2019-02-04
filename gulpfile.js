'use strict';

var gulp = require('gulp'),
    qunit = require('gulp-qunit'),
    size = require('gulp-size'),
    concat = require('gulp-concat'),
    through = require('through2'),
    jsSource = './src/**/*.js',

    closureCompiler = require('./deps/glift-core/dev/closure-compiler.js'),
    updateHtmlFiles = require('./deps/glift-core/dev/updatehtml.js'),
    jsSrcGlobGen = require('./deps/glift-core/dev/srcgen.js');

// The source paths, used for generating the glob, for determining sources.
var srcPaths = [
  // :Glift Core: //
  // Top level source package must go first since it defines the namespace
  'deps/glift-core/glift.js',

  // Enums are depended on directly by lots of other packages.
  'deps/glift-core/util',

  // The rest of glift-core
  'deps/glift-core',

  // :Glift UI: //
  // Everything else is in DFS+lexicographical+depth order.
  'src'];

// Ignore the test files, dev files
var srcIgnore = ['!src/**/*_test.js', '!deps/**/*_test.js', '!**/dev/*'];

// The glob used for determining tests. It's probably the case that we shouldn't
// run dep tests here, but that can be fixed later.
var testGlob = ['src/**/*_test.js', 'deps/**/*_test.js', ];

// The full build-test cycle. This:
// - Updates all the HTML files
// - Recreates the concat-target
// - Runs all the tests
// - Compiles with JSCompiler + TypeChecking
gulp.task('build-test', ['concat', 'compile', 'test'])

gulp.task('test', ['update-html-tests', 'update-html-srcs'], () => {
  return gulp.src('./test/htmltests_gen/QunitTest.html').pipe(qunit())
});

gulp.task('test-simple', () => {
  return gulp.src('./test/htmltests_gen/QunitTest.html').pipe(qunit())
});

// A watcher for the the full build-test cycle.
gulp.task('test-watch', () => {
  return gulp.watch([
    'src/**/*.js',
    'src/**/*_test.js'], ['test'] );
});

// A simpler watcher that just updates the
gulp.task('update-html-watch', () => {
  return gulp.watch([
    'src/**/*.js',
    'src/**/*_test.js'], ['update-html-tests', 'update-html-srcs'] );
})

// Compile the sources with the JS Compiler
gulp.task('compile', () => {
  return gulp.src(jsSrcGlobGen(srcPaths, srcIgnore))
    .pipe(closureCompiler('glift.js'))
    .pipe(size())
    .pipe(gulp.dest('./compiled/'))
})

gulp.task('concat', () => {
  return gulp.src(jsSrcGlobGen(srcPaths, srcIgnore))
    .pipe(concat('glift_combined.js'))
    .pipe(gulp.dest('./compiled/'))
})

// Update the HTML tests with the dev JS source files
gulp.task('update-html-srcs', () => {
  return gulp.src(jsSrcGlobGen(srcPaths, srcIgnore))
    .pipe(updateHtmlFiles({
      filesGlob: './test/htmltests/*.html',
      outDir: './test/htmltests_gen/',
      header: '<!-- AUTO-GEN-DEPS -->',
      footer: '<!-- END-AUTO-GEN-DEPS -->',
      dirHeader: '<!-- %s sources -->',
    }))
});

// Update the HTML tests with the test JS files
gulp.task('update-html-tests', () => {
  return gulp.src(testGlob)
    .pipe(updateHtmlFiles({
      filesGlob: './test/htmltests/QunitTest.html',
      outDir: './test/htmltests_gen/',
      header: '<!-- AUTO-GEN-TESTS -->',
      footer: '<!-- END-AUTO-GEN-TESTS -->',
      dirHeader: '<!-- %s tests -->',
    }))
})

// Update the HTML tests with the compiled glift.
gulp.task('update-html-compiled', ['compile'], () => {
  return gulp.src('./compiled/glift.js')
    .pipe(updateHtmlFiles({
      filesGlob: './test/htmltests/*.html',
      outDir: './test/htmltests_gen/',
      header: '<!-- AUTO-GEN-DEPS -->',
      footer: '<!-- END-AUTO-GEN-DEPS -->',
      dirHeader: '<!-- %s sources -->',
    }))
});

gulp.task('compile-test', ['update-html-compiled'], () => {
  return gulp.src('./test/htmltests_gen/QunitTest.html').pipe(qunit())
});

gulp.task('compile-watch', () => {
  return gulp.watch([
    'src/**/*.js',
    'src/**/*_test.js'], ['update-html-compiled'] );
});

gulp.task('src-gen', () => {
  gulp.src(jsSrcGlobGen(srcPaths, srcIgnore))
    .pipe(through.obj(function(file, enc, cb) {
      console.log(file.path);
      cb()
    }, function(cb) {
      cb()
    }));
});
