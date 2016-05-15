'use strict';

var gulp = require('gulp'),
    qunit = require('gulp-qunit'),
    gutil = require('gulp-util'),
    size = require('gulp-size'),
    concat = require('gulp-concat'),
    closureCompiler = require('gulp-closure-compiler'),
    through = require('through2'),
    nglob = require('glob'),
    jsSource = './src/**/*.js',

    fs = require('fs'),
    path = require('path');

var srcGlob = [
  'src/glift.js',
  // I'm not entirely sure why, but util must go first. Probably due to some
  // faulty name-space aliasing.
  'src/util/*.js', 
  'src/**/*.js',
  // Ignore these groups of files:
  '!src/**/*_test.js',
  '!src/htmltests/*',
  '!src/libs/*',
  '!src/testdata/*']

var testGlob = ['src/**/*_test.js']

// Note: The 
gulp.task('build', ['update-html-srcs-dev', 'update-html-tests', 'concat'])

gulp.task('build-test', ['build', 'compile', 'test'])

gulp.task('test', () => {
  return gulp.src('./src/htmltests/QunitTest.html')
      .pipe(qunit())
});

gulp.task('update-html-srcs-dev', () => {
  return gulp.src(srcGlob)
    .pipe(packageReorder())
    .pipe(updateHtmlFiles({
      filesGlob: './src/htmltests/*.html',
      header: '<!-- AUTO-GEN-DEPS -->',
      footer: '<!-- END-AUTO-GEN-DEPS -->',
      dirHeader: '<!-- %s sources -->',
    }))
});

gulp.task('update-html-tests', () => {
  return gulp.src(testGlob)
    .pipe(packageReorder())
    .pipe(updateHtmlFiles({
      filesGlob: './src/htmltests/QunitTest.html',
      header: '<!-- AUTO-GEN-TESTS -->',
      footer: '<!-- END-AUTO-GEN-TESTS -->',
      dirHeader: '<!-- %s tests -->',
    }))
})

gulp.task('compile', () => {
  return gulp.src(srcGlob)
    .pipe(packageReorder())
    .pipe(closureCompiler({
      compilerPath: './compiler-latest/compiler.jar',
      fileName: 'glift.js',
      compilerFlags: {
        language_in: 'ECMASCRIPT5',
        jscomp_error: [
          'accessControls',
          'checkRegExp',
          'constantProperty',
          'const',
          'missingProvide',
          'checkVars',
          'duplicate',
          'undefinedVars',
          'undefinedNames',
          'deprecated',
          'checkTypes',
          'missingProperties',
          'accessControls'
        ]
      }
    }))
    .pipe(size())
    .pipe(gulp.dest('./compiled/'))
})

gulp.task('concat', () => {
  return gulp.src(srcGlob)
    .pipe(packageReorder())
    .pipe(concat('glift_combined.js'))
    .pipe(size())
    .pipe(gulp.dest('./compiled/'))
})

gulp.task('test-watch', () => {
  gulp.watch(source , ['test'] );
});

/////////////// Library Functions ///////////////

// TODO(kashomon): Make a node library out of these?

/**
 * Reorder so that the file with the same name as the package comes first.
 */
function packageReorder(params) {
  var all = []
  return through.obj(function(file, enc, cb) {
    all.push(file);
    cb();
  }, function(cb) {
    var tr = [];
    var dirMap = {};
    all.forEach((f) => {
      var fullpath = f.path;
      var ppath = path.parse(f.path);
      var dir = ppath.dir;
      if (!dirMap[dir]) {
        dirMap[dir] = [];
      }
      var splat = ppath.dir.split(path.sep)
      var last = splat[splat.length - 1]
      if (last === ppath.name) {
        dirMap[dir].unshift(f)
      } else {
        dirMap[dir].push(f)
      }
    });
    for (var dir in dirMap) {
      dirMap[dir].forEach((f) => {
        tr.push(f);
      });
    }
    tr.forEach((f) => {
      this.push(f);
    });
    cb();
  });
};

function updateHtmlFiles(params) {
  var files = nglob.sync(params.filesGlob);
  var header = params.header;
  var footer = params.footer;
  var regexp = new RegExp(`(${header})(.|\n)*(${footer})`, 'g')

  var dirHeader = params.dirHeader;
  var all = [];
  var template = params.template || '<script type="text/javascript" src="%s"></script>';
  return through.obj(function(file, enc, cb) {
    all.push(file);
    cb();
  }, function(cb) {
    var htmldir = path.dirname(files[0])

    var tags = [];
    var lastdir = null
    all.forEach((f) => {
      var relpath = path.relative(htmldir, f.path)

      var dir = path.dirname(f.path)
      if (dir !== lastdir) {
        var splat = dir.split(path.sep)
        var last = splat[splat.length - 1]
        tags.push(dirHeader.replace('%s', last))
        lastdir = dir
      }

      tags.push(template.replace('%s', relpath))
      this.push(f)
    })

    var text = tags.join('\n');

    files.forEach((fname) => {
      gutil.log('Updating: ' + fname);
      var contents = fs.readFileSync(fname, {encoding: 'UTF-8'})
      var replaced = contents.replace(regexp, '$1\n' + text + '\n$3')
      fs.writeFileSync(fname, replaced)
    });

    cb();
  })
}
