'strict'

const glob = require('glob');
const path = require('path');
const through = require('through2');
const fs = require('fs');

/**
 * Package dev is entirely used for sharing Gulp build-related code across
 * various Glift-projects.
 */

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
var updateHtmlFiles = function(params) {
  var files = glob.sync(params.filesGlob);
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
};

module.exports = updateHtmlFiles;
