goog.provide('glift.api.StoneActions');
goog.provide('glift.api.StoneFn');


/**
 * A typedef representing an action that can be performed by clic
 *
 * @typedef {function(
 *  !Event,
 *  !glift.widgets.BaseWidget,
 *  !glift.Point)
 * }
 */
glift.api.StoneFn;

/**
 * Actions for stones.  If the user specifies his own actions, then the
 * actions specified by the user will take precedence.
 *
 * @param {glift.api.StoneActions=} opt_o
 *
 * @constructor @final @struct
 */
glift.api.StoneActions = function(opt_o) {
  var o = opt_o || {};

  // Note: We don't add a click function here because a default-click handler
  // doesn't make sense across widget types.

  /**
   * Add ghost-stone for cursor hovering.
   *
   * @type {!glift.api.StoneFn}
   */
  this.mouseover = o.mouseover || function(event, widget, pt) {
    var hoverColors = { 'BLACK': 'BLACK_HOVER', 'WHITE': 'WHITE_HOVER' };
    var currentPlayer = widget.controller.getCurrentPlayer();
    if (widget.controller.canAddStone(pt, currentPlayer)) {
      widget.display.intersections()
          .setStoneColor(pt, hoverColors[currentPlayer]);
    }
  };

  /**
   * Ghost-stone removal for cursor hovering.
   *
   * @type {!glift.api.StoneFn}
   */
  this.mouseout = o.mouseout || function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    if (widget.controller.canAddStone(pt, currentPlayer)) {
      widget.display && widget.display.intersections()
          .setStoneColor(pt, glift.enums.states.EMPTY);
    }
  };

  /**
   * A basic touchend function that defaults to the normal stone-click handler.
   * It's possible we may wish to expand this to include guide-lines.
   *
   * @type {!glift.api.StoneFn}
   */
  // TODO(kashomon): It's not clear if we want this. Revisit later.
  this.touchend = o.touchend || function(event, widget, pt) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();
    widget.sgfOptions.stoneClick(event, widget, pt);
  };
};
