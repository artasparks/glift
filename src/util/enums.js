/**
 * Various constants used throughout glift.
 */
glift.enums = {
  // Also sometimes referred to as colors. Might be good to change back
  states: {
    BLACK: 'BLACK',
    WHITE: 'WHITE',
    EMPTY: 'EMPTY'
  },

  boardAlignments: {
    TOP: "TOP",
    RIGHT: "RIGHT",
    CENTER: "CENTER"
  },

  directions: {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    TOP: 'TOP',
    BOTTOM: 'BOTTOM'
  },

  boardRegions: {
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
    // Minimal cropbox, modulo some heuristics.
    MINIMAL: 'MINIMAL'
  },


  controllerMessages: {
    CONTINUE: 'CONTINUE',
    DONE: 'DONE',
    FAILURE: 'FAILURE'
  },

  marks: {
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
    CORRECT_VARIATION: 'CORRECT_VARIATION'
  },

  problemResults: {
    CORRECT: 'CORRECT',
    INCORRECT: 'INCORRECT',
    INDETERMINATE: 'INDETERMINATE',
    FAILURE: 'FAILURE' // i.e., none of these (couldn't place stone).
  },

  displayDataTypes: {
    PARTIAL: 'PARTIAL',
    FULL: 'FULL'
  },

  /**
   * Used to create svg element Ids.  The enum values are slightly modified to
   * be compatible with being class / id names.
   */
  svgElements: {
    SVG: 'svg',
    BOARD: 'board',
    BOARD_COORD_LABELS: 'board_coord_labels',
    INTERSECTIONS_CONTAINER: 'intersections',
    BOARD_LINE: 'board_line',
    BOARD_LINE_CONTAINER: 'board_line_container',
    BUTTON: 'button',
    BUTTON_CONTAINER: 'button_container',
    FULL_BOARD_BUTTON: 'full_board_button',
    MARK: 'mark',
    TEMP_MARK_GROUP: 'temp_mark_group',
    MARK_CONTAINER: 'mark_container',
    GLIFT_ELEMENT: 'glift_element',
    STARPOINT: 'starpoint',
    STARPOINT_CONTAINER: 'starpoint_container',
    STONE: 'stone',
    STONE_CONTAINER: 'stone_container',
    STONE_SHADOW: 'stone_shadow',
    STONE_SHADOW_CONTAINER: 'stone_shadow_container',
    GUIDE_LINE: 'guide_line',

    // Icon-bar specific enums
    ICON: 'icon',
    ICON_CONTAINER: 'icon_container',
    TEMP_ICON: 'temp_icon',
    TEMP_TEXT: 'temp_text',
    TEMP_ICON_CONTAINER: 'temp_icon_container'
  },

  showVariations: {
    ALWAYS: 'ALWAYS',
    NEVER: 'NEVER',
    MORE_THAN_ONE: 'MORE_THAN_ONE'
  },

  /**
   * Widget types.  These tell the widget manager what widgets to create.
   */
  widgetTypes: {
    CORRECT_VARIATIONS_PROBLEM: 'CORRECT_VARIATIONS_PROBLEM',
    EXAMPLE: 'EXAMPLE',
    GAME_VIEWER: 'GAME_VIEWER',
    REDUCED_GAME_VIEWER: 'REDUCED_GAME_VIEWER',
    STANDARD_PROBLEM: 'STANDARD_PROBLEM',
    BOARD_EDITOR: 'BOARD_EDITOR'
  },

  boardComponents: {
    BOARD: 'BOARD',
    COMMENT_BOX: 'COMMENT_BOX',
    EXTRA_ICONBAR: 'EXTRA_ICONBAR',
    ICONBAR: 'ICONBAR',
    STATUS_BAR: 'STATUS_BAR'
  },

  dubug: {
    NONE: 'NONE',
    INFO: 'INFO'
  },

  // Intended to be for points
  rotations: {
    NO_ROTATION: 'NO_ROTATION',
    CLOCKWISE_90: 'CLOCKWISE_90',
    CLOCKWISE_180: 'CLOCKWISE_180',
    CLOCKWISE_270: 'CLOCKWISE_270'
  }
};
