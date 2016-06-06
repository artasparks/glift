goog.provide('glift.util.colors');

goog.require('glift.util');

glift.util.colors = {
  isLegalColor: function(color) {
    return color === glift.enums.states.BLACK ||
        color === glift.enums.states.WHITE ||
        color === glift.enums.states.EMPTY;
  },

  oppositeColor: function(color) {
    if (color === glift.enums.states.BLACK) return glift.enums.states.WHITE;
    if (color === glift.enums.states.WHITE) return glift.enums.states.BLACK;
    else return color;
  }
};
