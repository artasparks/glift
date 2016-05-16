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

// Force an ordering on the package structure.
var ordering = [
  // Top level source package must go first since it defines the namespace
  '.*/src$',
  // I'm not entirely sure why, but util must go first. Probably due to some
  // faulty name-space aliasing.
  '.*/util$',
  // For most packages it doesn't matter. However, to prevent commit thrashing
  // in the HTML tests, we sort the output files.
  // Implicitly, the laste entry is '.*',
]

var srcGlob = [
  'src/**/*.js',
  // Ignore these groups of files:
  '!src/**/*_test.js',
  '!src/htmltests/*',
  '!src/libs/*',
  '!src/testdata/*']

var testGlob = ['src/**/*_test.js']

// The full build-test cycle. This
// - Updates all the HTML files
// - Recreates the concat-target
// - Runs all the tests
// - Compiles with the
gulp.task('build-test', ['basicbuild', 'compile', 'test'])

// A watcher for the the full build-test cycle.
gulp.task('build-test-watch', () => {
  gulp.watch(source , ['build-test'] );
})

gulp.task('test', () => {
  return gulp.src('./src/htmltests/QunitTest.html').pipe(qunit())
});

gulp.task('test-watch', () => {
  gulp.watch(source , ['test'] );
});

// Compile the sources with the JS Compiler
gulp.task('compile', () => {
  return gulp.src(srcGlob)
    .pipe(packageReorder(ordering))
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
    .pipe(packageReorder(ordering))
    .pipe(concat('glift_combined.js'))
    .pipe(size())
    .pipe(gulp.dest('./compiled/'))
})

// Update the HTML tests with the dev JS source files
gulp.task('update-html-srcs-dev', () => {
  return gulp.src(srcGlob)
    .pipe(packageReorder(ordering))
    .pipe(updateHtmlFiles({
      filesGlob: './src/htmltests/*.html',
      header: '<!-- AUTO-GEN-DEPS -->',
      footer: '<!-- END-AUTO-GEN-DEPS -->',
      dirHeader: '<!-- %s sources -->',
    }))
});

// Update the HTML tests with the test JS files
gulp.task('update-html-tests', () => {
  return gulp.src(testGlob)
    .pipe(packageReorder(ordering))
    .pipe(updateHtmlFiles({
      filesGlob: './src/htmltests/QunitTest.html',
      header: '<!-- AUTO-GEN-TESTS -->',
      footer: '<!-- END-AUTO-GEN-TESTS -->',
      dirHeader: '<!-- %s tests -->',
    }))
})

// Update the HTML tests with the compiled glift.
gulp.task('update-html-compiled', () => {
  return gulp.src('./compiled/glift.js')
    .pipe(updateHtmlFiles({
      filesGlob: './src/htmltests/*.html',
      header: '<!-- AUTO-GEN-DEPS -->',
      footer: '<!-- END-AUTO-GEN-DEPS -->',
      dirHeader: '<!-- %s sources -->',
    }))
});

// Gulp task for the purpose of chaining.
gulp.task('basicbuild', ['update-html-srcs-dev', 'update-html-tests', 'concat'])

/////////////// Library Functions ///////////////

// TODO(kashomon): Make a node library out of these?

/**
 * Reorder so that the file with the same name as the package comes first.
 */
function packageReorder(orderx) {
  var all = []
  var orderx = (orderx || []).slice()
  orderx = orderx.map((s) => new RegExp(s, 'g'))
  return through.obj(function(file, enc, cb) {
    all.push(file);
    cb();
  }, function(cb) {
    var tr = [];
    var dirMap = {};
    var dirlist = []; // So we can order the directories.
    all.forEach((f) => {
      var fullpath = f.path;
      var ppath = path.parse(f.path);
      var dir = ppath.dir;
      if (!dirMap[dir]) {
        dirMap[dir] = [];
        dirlist.push(dir);
      }
      var splat = ppath.dir.split(path.sep)
      var last = splat[splat.length - 1]
      if (last === ppath.name) {
        dirMap[dir].unshift(f)
      } else {
        dirMap[dir].push(f)
      }
    });

    // Do some nasty sorting to ensure the order is stable
    var dirlistSorted = []
    var processed = {}
    for (var i = 0; i <= orderx.length; i++) {
      var reg;
      if (i === orderx.length) {
        reg = /.*/;
      } else {
        reg = orderx[i];
      }
      var suborder = []
      dirlist.forEach((d) => {
        if (!processed[d] && reg.test(d)) {
          suborder.push(d)
          processed[d] = true;
        } else {
        }
      })
      suborder.sort()
      dirlistSorted = dirlistSorted.concat(suborder);
    }

    dirlistSorted.forEach((dir) => {
      dirMap[dir].forEach((f) => {
        tr.push(f);
      });
    })
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
        tags.push(dirHeader.replace('%s', path.relative(htmldir, dir)))
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
