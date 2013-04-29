otre.util.colors = {
  isLegalColor: function(color) {
    return color === enums.states.BLACK ||
        color === enums.states.WHITE ||
        color === enums.states.EMPTY;
  },

  oppositeColor: function(color) {
    if (color === enums.states.BLACK) return enums.states.WHITE;
    if (color === enums.states.WHITE) return enums.states.BLACK;
    else return color;
  }
};
