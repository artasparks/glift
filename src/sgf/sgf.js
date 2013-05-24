/*
 * The SGF library contains functions for dealing with SGFs.
 *
 * sgf_grammar.js: sgf parser generated, generated from
 * sgf_grammar.pegjs. To regenerate the parser from the peg grammar, use
 * jszip.py.
 *
 */
glift.sgf = {
  colorToToken: function(color) {
    if (color === glift.enums.states.WHITE) {
      return 'W';
    } else if (color === glift.enums.states.BLACK) {
      return 'B';
    } else {
      throw "Unknown color-to-token conversion for: " + color;
    }
  },

  // SGFs are indexed from the Upper Left:
  //  _  _  _
  // |aa ba ca ...
  // |ab bb
  // |.
  // |.
  // |.
  sgfCoordToPoint: function(c) {
    var a = 'a'.charCodeAt(0)
    return glift.util.point(c.charCodeAt(0) - a, c.charCodeAt(1) - a);
  },

  allSgfCoordsToPoints: function(arr) {
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      out.push(glift.sgf.sgfCoordToPoint(arr[i]));
    }
    return out;
  },

  convertFromLabelData: function(data) {
    var parts = data.split(":"),
        pt = glift.sgf.sgfCoordToPoint(parts[0]),
        value = parts[1];
    return {point: pt, value: value};
  },

  convertFromLabelArray: function(arr) {
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      out.push(glift.sgf.convertFromLabelData(arr[i]));
    }
    return out;
  },

  pointToSgfCoord: function(pt) {
    var a = 'a'.charCodeAt(0);
    return String.fromCharCode(pt.x() +  a) + String.fromCharCode(pt.y() + a);
  }
};
