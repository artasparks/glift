goog.provide('glift.parse');

/**
 * Glift parsing for strings.
 */
glift.parse = {
  /**
   * Parse types
   * @enum {string}
   */
  parseType: {
    /** FF1-FF4 Parse Type. */
    SGF: 'SGF',

    /** Tygem .gib files. */
    TYGEM: 'TYGEM',

    /**
     * DEPRECATED.  This was created when I didn't understand the destinction
     * between the various FF1-3 versions and FF4
     *
     * Prefer SGF, this is now equivalent.
     */
    PANDANET: 'PANDANET'
  },

  /**
   * List of known suffixes and the filetypes they match to.
   * @type {!Object<string, glift.parse.parseType>}
   */
  suffixToType: {
    '.sgf': 'SGF',
    '.gib': 'TYGEM',
  },

  /**
   * Determines whether a file is a known Go file.
   *
   * @param {string} filename The filename
   * @return {boolean} whether or not the filename has a known type
   */
  knownGoFile: function(filename) {
    if (!filename || typeof(filename) !== 'string') {
      return false
    }
    for (var key in glift.parse.suffixToType) {
      if (filename.indexOf(key) > -1) {
        return true;
      }
    }
    return false;
  },

  /**
   * Get the parse-type from a filename
   *
   * @param {string} filename Filename
   * @return {glift.parse.parseType} The parse type
   */
  parseTypeFromFilename: function(filename) {
    var ttype = glift.parse.parseType.SGF; // default type = SGF.
    for (var key in glift.parse.suffixToType) {
      if (filename.indexOf(key) > -1) {
        ttype = glift.parse.suffixToType[key];
      }
    }
    return ttype;
  },

  /**
   * Parse a Go-format format from a string.
   *
   * @param {string} str Raw contents that need to be parsed.
   * @param {string} filename Name of the file from which the contents came.
   * @return {!glift.rules.MoveTree}
   */
  fromFileName: function(str, filename) {
    return glift.parse.fromString(
        str, glift.parse.parseTypeFromFilename(filename));
  },

  /**
   * Transforms a stringified game-file into a movetree.
   *
   * @param {string} str Raw contents that need to be parsed.
   * @param {glift.parse.parseType=} opt_ttype The parse type. Defaults to SGF
   *    if unspecified.
   * @return {!glift.rules.MoveTree} The generated movetree
   */
  fromString: function(str, opt_ttype) {
    var ttype = opt_ttype || glift.parse.parseType.SGF;
    if (ttype === glift.parse.parseType.PANDANET) {
      // PANDANET type is now equivalent to SGF.
      ttype = glift.parse.parseType.SGF;
    }
    var methodName = glift.enums.toCamelCase(ttype);
    var func = glift.parse[methodName];
    var movetree = func(str);
    return glift.rules.movetree.initRootProperties(movetree);
  }
};
