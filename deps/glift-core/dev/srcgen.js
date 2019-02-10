'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Package dev is entirely used for sharing Gulp build-related code across
 * various Glift-projects.
 */

//
// Beware! Below lie demons unvanquished.
//

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
var jsSrcGlobGen = function(ordering, addGlobs, compileTs) {
  if (typeof ordering !== 'object' || !ordering.length) {
    throw new Error(
        'Ordering must be a non-empty array of paths. ' +
        'Was: ' + (typeof ordering) + ':' + String(ordering));
  }

  compileTs = !!compileTs;

  var out = [];
  var addGlobs = addGlobs || [];

  var rread = function(dirPath) {
    var components = dirPath.split(path.sep);
    var last = components[components.length - 1];

    var nsfile = path.join(dirPath, last + '.js');
    if (fs.existsSync(nsfile)) {
      out.push(nsfile);
    }
    if (compileTs) {
      var tsfile = path.join(dirPath, last + '.ts');
      if (fs.existsSync(tsfile)) {
        out.push(tsfile);
      }
    }

    out.push(path.join(dirPath, '*.js'));

    if (compileTs) {
      out.push(path.join(dirPath, '*.ts'));
    }

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
};

module.exports = jsSrcGlobGen;
