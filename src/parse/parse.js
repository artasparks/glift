goog.provide('glift.parse');

/**
 * Glift parsing
 */
glift.parse = {
  /**
   * Parse types
   * @enum {string}
   */
  parseType: {
    /** FF4 Parse Type */
    SGF: 'SGF',
    /** Tygem .gib files. */
    TYGEM: 'TYGEM',
    /** 
     * Really, this is FF3.
     * TODO(kashomon): Support FF3 as first class citizen
     */
    PANDANET: 'PANDANET'
  },

  /**
   * Parse a Go-format format from a string.
   *
   * @param {string} str Raw contents that need to be parsed.
   * @param {string} filename Name of the file from which the contents came.
   * @return {!glift.rules.MoveTree}
   */
  fromFileName: function(str, filename) {
    var parseType = glift.parse.parseType;
    var ttype = parseType.SGF;
    if (filename.indexOf('.sgf') > -1) {
      if (str.indexOf('PANDANET') > -1) {
        ttype = parseType.PANDANET;
      } else {
        ttype = parseType.SGF;
      }
    } else if (filename.indexOf('.gib') > -1) {
      ttype = parseType.TYGEM;
    }
    return glift.parse.fromString(str, ttype);
  },

  /**
   * Transforms a stringified game-file into a movetree.
   *
   * @param {string} str Raw contents that need to be parsed.
   * @param {glift.parse.parseType=} opt_ttype The parse type.
   * @return {!glift.rules.MoveTree}
   */
  fromString: function(str, opt_ttype) {
    var ttype = opt_ttype || glift.parse.parseType.SGF;
    var methodName = glift.enums.toCamelCase(ttype);
    var func = glift.parse[methodName];
    var movetree = func(str);
    return glift.rules.movetree.initRootProperties(movetree);
  }
};
