/**
 * Glift parsing
 */
glift.parse = {
  /** Parse types */
  parseType: {
    SGF: 'SGF',
    TYGEM: 'TYGEM',
    PANDANET: 'PANDANET'
  },

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
   */
  fromString: function(str, ttype) {
    var ttype = ttype || glift.transform.transformType.SGF;
    var methodName = glift.enums.toCamelCase(ttype);
    var func = glift.parse[methodName];
    var movetree = func(str);
    return glift.rules.movetree.initRootProperties(movetree);
  }
};
