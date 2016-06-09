goog.provide('glift.themes.clasess');


/**
 * Built-in classes used to style Glift.
 *
 * Q: Should glift ever be styled in two different ways in the page? My gut says
 * that should be allowed, but I can't think of a counter example.
 *
 * @enum{string}
 */
glift.themes.classes = {
  /** Css container for generic text boxes. */
  TEXT_BOX: 'glift-text-box',

  /** An elem that's absolutely positioned */
  ABSOLUTE_ELEM: 'glift-absolute-elem',

  //////////////////////////
  // Basic board elements //
  //////////////////////////

  BOARD: 'glift-board',
  STARPOINTS: 'glift-starpoints',
  BOARD_LINES: 'glift-board-lines',
  BOARD_COORD_LABELS: 'glift-board-coord-labels',

  STONE_SHADOWS: 'glift-stone-shadows',
  STONE_MARKS: 'glift-stone-marks',
};
