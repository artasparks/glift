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

// Force an ordering on the package structure. It would be nice to use
// gulp-ordering and get ride of the packageReorder function, but that would
// require changing the way namespaces are created.
var ordering = [
  // Top level source package must go first since it defines the namespace
  '.*/src$',
  // I'm not entirely sure why, but util must go first. Probably due to some
  // faulty name-space aliasing.
  '.*/util$',
  // The widgetopt dir depends *directly* on the controllers. Yuck. These need
  // to be refactored, probably by putting the widget options directly in the
  // controller dirs.
  '.*/controllers$',
  // For most packages it doesn't matter. However, to prevent commit thrashing
  // in the HTML tests, we sort the output files.
  // Implicitly, the last entry is '.',
]

// The glob used for determining sources.
var srcGlob = [
  'src/**/*.js',
  // Ignore these groups of files:
  '!src/**/*_test.js',
  '!src/htmltests/*',
  '!src/libs/*',
  '!src/testdata/*']

// The glob used for determining tests
var testGlob = ['src/**/*_test.js']

// The full build-test cycle. This:
// - Updates all the HTML files
// - Recreates the concat-target
// - Runs all the tests
// - Compiles with JSCompiler + TypeChecking
gulp.task('build-test', ['concat', 'compile', 'test'])

gulp.task('test', ['update-html-tests', 'update-html-srcs'], () => {
  return gulp.src('./src/htmltests_gen/QunitTest.html').pipe(qunit())
});

gulp.task('test-simple', () => {
  return gulp.src('./src/htmltests_gen/QunitTest.html').pipe(qunit())
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
  return gulp.src(srcGlob)
    .pipe(packageReorder(ordering))
    .pipe(closureCompiler({
      compilerPath: './compiler-latest/compiler.jar',
      fileName: 'glift.js',
      compilerFlags: {
        // TODO(kashomon): Turn on ADVANCED_OPTIMIZATIONS when all the right
        // functions have been marked @export, where appropriate
        // compilation_level: 'ADVANCED_OPTIMIZATIONS',
        //
        language_in: 'ECMASCRIPT5',
        // Note that warning_level=VERBOSE corresponds to:
        //
        // --jscomp_warning=checkTypes
        // --jscomp_error=checkVars
        // --jscomp_warning=deprecated
        // --jscomp_error=duplicate
        // --jscomp_warning=globalThis
        // --jscomp_warning=missingProperties
        // --jscomp_warning=undefinedNames
        // --jscomp_error=undefinedVars
        //
        // Do some advanced Javascript checks.
        // https://github.com/google/closure-compiler/wiki/Warnings
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
          // We don't turn requires into Errors, because the closure compiler
          // reorders the sources based on the requires.
          // 'missingRequire',

          // TODO(kashomon): Turn on global this checking
          // 'globalThis',
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
gulp.task('update-html-srcs', () => {
  return gulp.src(srcGlob)
    .pipe(packageReorder(ordering))
    .pipe(updateHtmlFiles({
      filesGlob: './src/htmltests/*.html',
      outDir: './src/htmltests_gen/',
      header: '<!-- AUTO-GEN-DEPS -->',
      footer: '<!-- END-AUTO-GEN-DEPS -->',
      dirHeader: '<!-- %s sources -->',
    }))
});

// Update the HTML tests with the test JS files
gulp.task('update-html-tests', () => {
  return gulp.src(testGlob)
    .pipe(packageReorder())
    .pipe(updateHtmlFiles({
      filesGlob: './src/htmltests/QunitTest.html',
      outDir: './src/htmltests_gen/',
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
      outDir: './src/htmltests_gen/',
      header: '<!-- AUTO-GEN-DEPS -->',
      footer: '<!-- END-AUTO-GEN-DEPS -->',
      dirHeader: '<!-- %s sources -->',
    }))
});

/////////////////////////////////////////////////
/////////////// Library Functions ///////////////
/////////////////////////////////////////////////
//
// Beware! Below lie demons unvanquished.
//
// TODO(kashomon): Move these to a node library for sharing with GPub?

/**
 * Reorder so that the file with the same name as the package comes first.
 */
function packageReorder(orderx) {
  var all = []
  var orderx = (orderx || []).slice()
  orderx = orderx.map((s) => new RegExp(s))
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

    // Based on the ordering array passed in, group the directories togther and
    // do sorting based on the groupings.
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
  var outDir = params.outDir;

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

    if (!fs.existsSync(outDir)){
      fs.mkdirSync(outDir);
    }

    files.forEach((fname) => {
      var parsedPath = path.parse(fname)
      var outPath = path.join(outDir, parsedPath.base)
      if (!fs.existsSync(outPath)) {
        // First we write the template files.
        var contents = fs.readFileSync(fname, {encoding: 'UTF-8'})
        fs.writeFileSync(outPath, contents)
      }
      // Then, read from the newly-written file and overwrite the template
      // sections.
      var contents = fs.readFileSync(outPath, {encoding: 'UTF-8'})
      var replaced = contents.replace(regexp, '$1\n' + text + '\n$3')
      fs.writeFileSync(outPath, replaced)
    });

    cb();
  })
}
