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

  /**
   * Transforms a stringified game-file into a movetree.
   */
  fromString: function(str, ttype) {
    var ttype = ttype || glift.transform.transformType.SGF;
    var methodName = glift.enums.toCamelCase(ttype);
    var func = glift.parse[methodName];
    return func(str);
  }
};
