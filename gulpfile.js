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

// The glob used for determining sources.
var srcGlob = [
  // Top level source package must go first since it defines the namespace
  'src/*.js',
  // Enums are depended on directly by lots of other packages.
  'src/util/*.js',
  // The widgetopt dir depends *directly* on the controllers. Yuck. These need
  // to be refactored, probably by putting the widget options directly in the
  // controller dirs.
  'src/controllers/*.js',
  // Everything else is in a semi-lexicographical order (but it's not
  // guaranteed).
  'src/**/*.js',
  // Ignore these groups of files:
  '!src/**/*_test.js',
  '!src/htmltests/*',
  '!src/libs/*', // Qunit, Raphael
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
    .pipe(packageReorder())
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
          'checkTypes',
          'checkVars',
          'const',
          'constantProperty',
          'deprecated',
          'duplicate',
          'globalThis',
          'missingProperties',
          'missingProvide',
          'missingReturn',
          'undefinedNames',
          'undefinedVars',
          'visibility',
          // We don't turn requires into Errors, because the closure compiler
          // reorders the sources based on the requires.
          // 'missingRequire',
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

// Update the HTML tests with the dev JS source files
gulp.task('update-html-srcs', () => {
  return gulp.src(srcGlob)
    .pipe(packageReorder())
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
 * Reorder so that the file with the same name as the package comes first. The
 * idea is that the file with the same name as the directory defines the
 * namespace. This, of course, enforces a java-like style of defining
 * namespaces, but it's at least easy to understand at a large scale because the
 * directory structure represents the package structure.
 *
 * I.e., If there are two directories
 *
 * foo/
 *    fib.js
 *    fob.js
 *    foo.js
 * bar/
 *    blah.js
 *    bar.js
 *    zed.js
 *
 * This will get reordered to
 *
 * foo/ -> [foo.js, fib.js, fob.js]
 * bar/ -> [bar.js, blah.js, zed.js]
 *
 */
function packageReorder() {
  var all = []
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
        // If the file is the directory name + .js, then it's the namespace file
        // and we bump it to teh top.
        dirMap[dir].unshift(f)
      } else {
        // otherwise, just stuff it on the end =)
        dirMap[dir].push(f)
      }
    });

    dirlist.forEach((dir) => {
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


/**
 * A function to update the HTML files. The idea is that updateHtmlFiles takes a
 * glob of files and treats them as templates. It goes through and add
 * sources to these files then outputs them to  the specified outDir
 *
 * @param {string} filesGlob The glob of html files.
 * @param {string} header The header marker to indicate where to dump the JS
 *    sources.
 * @param {string} footer The footer marker to indicate where to dump the JS
 *    sources.
 * @param {string} outDir the output dir for the templated files.
 * @param {string} template the template to use.
 *
 * @return an object stream
 * Note: this gets the 'srcs' as part of the Vinyl file stream.
 */
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
