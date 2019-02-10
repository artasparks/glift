'use strict';


/**
 *
 */

const closureCompiler = require('google-closure-compiler').gulp({
  // extraArguments: ['-Xms2048m']
});

/**
 * defaultCompile passes defaults to the closureCompiler
 *
 * @param {string} outName whatever defaultCompile produces.
 *
 * @return {object} whatever closureCompiler returns.
 */
var defaultCompile = function(outName) {
  if (outName == '') {
    throw new Error('Name is required but was not provided')
  }

  return closureCompiler({
    js_output_file: outName,
    language_in: 'ECMASCRIPT5_STRICT',
    // TODO(kashomon): Turn on ADVANCED_OPTIMIZATIONS when all the right
    // functions have been marked @export, where appropriate
    // compilation_level: 'ADVANCED_OPTIMIZATIONS',
    //
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
    ],
  });
};

module.exports = defaultCompile;
