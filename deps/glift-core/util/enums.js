goog.provide('glift.enums');

goog.require('glift');

/**
 * Various constants used throughout glift.
 */
glift.enums = {
  /**
   * Camel cases an enum. Can be useful for things that have functions or
   * packages named from enum names.
   *
   * @param {string} input The enum to input
   * @return {string} transformed enum name.
   */
  toCamelCase: function(input) {
    return input.toLowerCase().replace(/_(.)?/g, function(match, group1) {
      return group1 ? group1.toUpperCase() : '';
    });
  },
};

/**
 * Also sometimes referred to as colors.
 * @enum{string}
 */
glift.enums.states = {
  BLACK: 'BLACK',
  WHITE: 'WHITE',
  EMPTY: 'EMPTY'
};

/**
 * @enum{string}
 */
glift.enums.boardAlignments = {
  TOP: 'TOP',
  RIGHT: 'RIGHT',
  CENTER: 'CENTER'
};


/**
 * List of directions. Used for a variety of tasks.
 * @enum{string}
 */
glift.enums.directions = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  TOP: 'TOP',
  BOTTOM: 'BOTTOM'
};

/**
 * List of board regions. Usually used for cropping.
 * @enum{string}
 */
glift.enums.boardRegions = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  TOP: 'TOP',
  BOTTOM: 'BOTTOM',
  TOP_LEFT: 'TOP_LEFT',
  TOP_RIGHT: 'TOP_RIGHT',
  BOTTOM_LEFT: 'BOTTOM_LEFT',
  BOTTOM_RIGHT: 'BOTTOM_RIGHT',
  ALL: 'ALL',
  // Automatically determine the board region.
  AUTO: 'AUTO',
  // Minimal cropbox, modulo some heuristics. To do this, you usually need a
  // movetree, and usually, you need next-path information.
  MINIMAL: 'MINIMAL'
};

/**
 * @enum {string}
 */
glift.enums.marks = {
  CIRCLE: 'CIRCLE',
  SQUARE: 'SQUARE',
  TRIANGLE: 'TRIANGLE',
  XMARK: 'XMARK',
  // STONE_MARKER marks the last played stone
  STONE_MARKER: 'STONE_MARKER',
  LABEL: 'LABEL',

  // These last few 'marks' are variations on the LABEL mark type.
  // TODO(kashomon): Consolidate these somehow.
  //
  // Neither LABEL_ALPHA nor LABEL_NUMERIC are used for rendering, but they
  // are extremly convenient to have this distinction when passing information
  // from the display to the controller
  LABEL_ALPHA: 'LABEL_ALPHA',
  LABEL_NUMERIC: 'LABEL_NUMERIC',

  // There last two are variations on the LABEL mark. VARIATION_MARKER is used
  // so we can color labels differently for variations.
  VARIATION_MARKER: 'VARIATION_MARKER',

  // We color 'correct' variations differently in problems,
  CORRECT_VARIATION: 'CORRECT_VARIATION',

  // We color 'correct' variations differently in problems,
  KO_LOCATION: 'KO_LOCATION'
};

/**
 * Enum to indicate how a move for a problem was resolved.
 * @enum {string}
 */
glift.enums.problemResults = {
  CORRECT: 'CORRECT',
  INCORRECT: 'INCORRECT',
  INDETERMINATE: 'INDETERMINATE',
  FAILURE: 'FAILURE' // i.e., none of these (couldn't place stone).
};

/**
 * Whether or not to show variations in the UI.
 * @enum {string}
 */
glift.enums.showVariations = {
  ALWAYS: 'ALWAYS',
  NEVER: 'NEVER',
  MORE_THAN_ONE: 'MORE_THAN_ONE'
};

/**
 * Rotations we can apply to Go Boards. Doesn't rotate the fundamental data (the
 * SGF points), but rotates at the time the board is drawn.
 * @enum {string}
 */
glift.enums.rotations = {
  NO_ROTATION: 'NO_ROTATION',
  CLOCKWISE_90: 'CLOCKWISE_90',
  CLOCKWISE_180: 'CLOCKWISE_180',
  CLOCKWISE_270: 'CLOCKWISE_270'
};

/**
 * Flips that can be applied to a go board.
 * @enum {string}
 */
glift.enums.Flip = {
  /** Don't perform a flip. A no-action default. */
  NO_FLIP: 'NO_FLIP',
  /** Flip vertically. In otherwords, flip points over the X axis (the Y points). */
  VERTICAL: 'VERTICAL',
  /** Flip horizontally. In otherwords, flip points over the Y axis (the X points). */
  HORIZONTAL: 'HORIZONTAL',
};
