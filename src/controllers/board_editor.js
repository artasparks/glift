glift.controllers.boardEditor = function(sgfOptions) {
  var ctrl = glift.controllers;
  var baseController = glift.util.beget(ctrl.base());
  glift.util.setMethods(baseController, ctrl.BoardEditorMethods);
  glift.util.setMethods(baseController, ctrl.BoardEditorMethods);
  baseController.initOptions(sgfOptions);
  return baseController;
};

glift.controllers.BoardEditorMethods = {
  extraOptions: function(sgfOptions) {
    // TODO(kashomon): Record the used marks.
  },

  /**
   * Add a stone.
   */
  addStone: function(point, color) {
    console.log(point);
    console.log(color);
    console.log(mark);
  },

  addMark: function(point, mark) {

  },

  /**
   * Add a stone placement.  These are properties indicated by AW and AB.  They
   * do not indicate a change in move number.
   */
  addPlacement: function(point, color) {
  },

  pass: function() { throw new Error("Not implemented"); },
  clearMark: function() { throw new Error("Not implemented"); },
  clearStone: function() { throw new Error("Not implemented"); }
};
