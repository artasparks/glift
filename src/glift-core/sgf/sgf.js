/**
 * The SGF library contains functions for dealing with SGFs.
 *
 * This includes a parser and various utilities related to SGFs.
 */
glift.sgf = {
  /** Return a move property from a property. */
  colorToToken: function(color) {
    if (color === glift.enums.states.WHITE) {
      return 'W';
    } else if (color === glift.enums.states.BLACK) {
      return 'B';
    } else {
      throw "Unknown color-to-token conversion for: " + color;
    }
  },

  /** Return placement property from a color. */
  colorToPlacement: function(color) {
    if (color === glift.enums.states.WHITE) {
      return 'AW';
    } else if (color === glift.enums.states.BLACK) {
      return 'AB';
    } else {
      throw "Unknown color-to-token conversion for: " + color;
    }
  },

  /**
   * Given a Glift mark type (enum), returns the revelant SGF property string.
   * If no such mapping is found, returns null.
   *
   * Example: XMARK => MA
   *          FOO => null
   */
  markToProperty: function(mark)  {
    var allProps = glift.rules.prop;
    var markToPropertyMap = {
      LABEL_ALPHA: allProps.LB,
      LABEL_NUMERIC: allProps.LB,
      LABEL: allProps.LB,
      XMARK: allProps.MA,
      SQUARE: allProps.SQ,
      CIRCLE: allProps.CR,
      TRIANGLE: allProps.TR
    };
    return markToPropertyMap[mark] || null;
  },

  /**
   * Given a SGF property, returns the relevant SGF property. If no such mapping
   * is found, returns null.
   *
   * Example: MA => XMARK
   *          FOO => null.
   */
  propertyToMark: function(prop) {
    var marks = glift.enums.marks;
    var propertyToMarkMap = {
      LB: marks.LABEL,
      MA: marks.XMARK,
      SQ: marks.SQUARE,
      CR: marks.CIRCLE,
      TR: marks.TRIANGLE
    };
    return propertyToMarkMap[prop] || null;
  },

  /**
   * Converts an array of SGF points ('ab', 'bb') to Glift points ((0,1),
   * (1,1)).
   */
  allSgfCoordsToPoints: function(arr) {
    var out = [];
    if (!arr) {
      return out;
    }
    for (var i = 0; i < arr.length; i++) {
      out.push(glift.util.pointFromSgfCoord(arr[i]));
    }
    return out;
  },

  /**
   * Convert label data to a simple object.
   */
  convertFromLabelData: function(data) {
    var parts = data.split(":"),
        pt = glift.util.pointFromSgfCoord(parts[0]),
        value = parts[1];
    return {point: pt, value: value};
  },

  convertFromLabelArray: function(arr) {
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      out.push(glift.sgf.convertFromLabelData(arr[i]));
    }
    return out;
  }
};
