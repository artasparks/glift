goog.provide('glift.controllers.GameFigure');
goog.provide('glift.controllers.gameFigure');

goog.require('glift.controllers.BaseController');

/**
 * A GameFigure encapsulates the idea of a read-only SGF.
 *
 * @return glift.controllers
 */
glift.controllers.gameFigure = function(sgfOptions) {
  var baseController = glift.util.beget(
      glift.controllers.base());
  var newController = glift.util.setMethods(baseController,
      glift.controllers.GameFigure.prototype);
  newController.initOptions(sgfOptions);
  return newController;
};

/**
 * Stub class to be used for inheritance.
 *
 * @extends {glift.controllers.BaseController}
 * @constructor
 * @final
 */
glift.controllers.GameFigure = function() {
};

glift.controllers.GameFigure.prototype = {
  /**
   * Additional setup for the gamefigure.
   * @override
   */
  extraOptions: function() {
    // TODO(kashomon): Add this back in once the Flattener is the source of
    // truth for the UI.

    // var rules = glift.rules;
    // var initTreepath = treepath || this.initialPosition;
    // this.treepath = rules.treepath.parsePath(initTreepath);

    // var initialPosition = this.treepath.length; // used later
    // var nextTreepath = this.drawTo - this.treepath.length;
    // if (this.nextMovesPath.length > 0) {
      // nextTreepath = this.nextMovesPath;
    // }
    // nextTreepath = rules.treepath.parsePath(nextTreepath);
    // this.treepath = this.treepath.concat(nextTreepath);

    // this.movetree = rules.movetree.getFromSgf(
        // this.sgfString,
        // this.treepath,
        // this.parseType);
    // var gobanData = rules.goban.getFromMoveTree(this.movetree, this.treepath);
    // this.goban = gobanData.goban;

    // this.captureHistory = gobanData.captures;

    // // calculate marks, by going backwards through the movetree
    // var curnode = this.movetree.node();
    // var labels = [];
    // for (var i = this.treepath.length; i > initialPosition; i--) {
      // labels.push(curnode.getIntersection() + ":" + i);
      // curnode = curnode.getParent();
    // }

    // // add marks
    // var prop = glift.rules.prop;
    // this.movetree.properties().add(prop.LB, labels);
  }
};
