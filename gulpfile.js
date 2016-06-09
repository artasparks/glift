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

// The source paths, used for generating the glob, for determining sources.
var srcPaths = [
  // :Glift Core: //
  // Top level source package must go first since it defines the namespace
  'src/glift-core/glift.js',

  // Enums are depended on directly by lots of other packages.
  'src/glift-core/util',

  // The rest of glift-core
  'src/glift-core',

  // :Glift UI: //

  // The widgetopt dir depends *directly* on the controllers. Yuck. These need
  // to be refactored, probably by putting the widget options directly in the
  // controller dirs.
  'src/glift-ui/controllers',

  // Everything else is in lexicographical order
  'src/glift-ui']

// Ignore the test files
var srcIgnore = ['!src/**/*_test.js']

// The glob used for determining tests
var testGlob = ['src/**/*_test.js']

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
  return gulp.src(jsSrcGlobGen(srcPaths, srcIgnore))
    .pipe(concat('glift_combined.js'))
    .pipe(size())
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

/////////////////////////////////////////////////
/////////////// Library Functions ///////////////
/////////////////////////////////////////////////
//
// Beware! Below lie demons unvanquished.
//
// TODO(kashomon): Move these to a node library for sharing with GPub


/**
 * Takes an ordering array and an ignore glob-array and generates a glob array
 * appropriate for gulp. What this does is take an array of paths (both files
 * and directorys), and recursively generates directory-based globs.
 *
 * Glift (and co) have an idiosyncratic way of genserating namespaces.
 * Namepsaces are created files with the same name as a directory. For example,
 * src/foo should have a file that defines glift.foo = {}; Thus, these files
 * must go first before all other files that depend on that namespace.
 *
 * As an expanded example, consider the following directories:
 *
 * src/
 *  foo/
 *    abc.js
 *    foo.js
 *    zed.js
 *  bar/
 *    bbc.js
 *    bar.js
 *    zod.js
 *    biff/
 *      biff.js
 *      boff.js
 *
 * So, when called as such:
 *    jsSrcGlobGen(['src'])
 *
 * The following array would be produced:
 *    [
 *      'src/*.js', 'src/foo/foo.js', 'src/foo/*.js', 'src/bar/bar.js',
 *      'src/bar/biff/biff.js', 'src/bar/biff/*.js'
 *    ]
 *
 * Note: for convenience, users may pass in a set of normal node-glob style
 * globs that will be appended to the generated globs.
 *
 * I.e., if jsSrcGlobGen is called with
 *    jsSrcGlobGen(['src'], ['!src/**' + '/*_test.js'])
 *
 * Then, assuming the directory structure above, the output array will be
 *   [ 'src/*.js', ..., !src/**' + ' /*_test.js']
 *
 * (note: Concatenation is used to avoid comment-breaks).
 */
function jsSrcGlobGen(ordering, addGlobs) {
  if (typeof ordering !== 'object' || !ordering.length) {
    throw new Error(
        'Ordering must be a non-empty array of paths. ' +
        'Was: ' + (typeof ordering) + ':' + String(ordering));
  }

  var out = [];
  var addGlobs = addGlobs || [];

  var rread = function(dirPath) {
    var components = dirPath.split(path.sep);
    var last = components[components.length - 1];

    var nsfile = path.join(dirPath, last + '.js');
    if (fs.existsSync(nsfile)) {
      out.push(nsfile);
    }
    out.push(path.join(dirPath, '*.js'));

    fs.readdirSync(dirPath).forEach((f) => {
      var fpath = path.join(dirPath, f)
      var fd = fs.lstatSync(fpath);
      if (fd.isDirectory()) {
        rread(fpath)
      }
    });
  }

  ordering.forEach((fpath) => {
    if (!fs.existsSync(fpath)) {
      console.warn('Path does not exist: ' + path);
      return;
    }
    var fd = fs.lstatSync(fpath);
    if (!fd.isDirectory()) {
      out.push(fpath);
    } else {
      rread(fpath);
    }
  })

  return out.concat(addGlobs);
}


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
