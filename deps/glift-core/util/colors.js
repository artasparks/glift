goog.provide('glift.util.colors');

goog.require('glift.util');

glift.util.colors = {
  /**
   * @param {glift.enums.states} color
   * @return {glift.enums.states} The opposite color
   */
  oppositeColor: function(color) {
    if (color === glift.enums.states.BLACK) return glift.enums.states.WHITE;
    if (color === glift.enums.states.WHITE) return glift.enums.states.BLACK;
    else return color;
  }
};
