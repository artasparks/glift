// Otre: A Go Studying Program
// Copyright (c) 2012, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License
otre.enums = {
  components: {
    CONTROLLER: "CONTROLLER",
    DISPLAY: "DISPLAY",
    TRANSITION: "TRANSITION"
  },

  displayTypes: {
    BASE: "DISPLAY_BASE",
    SIMPLE_BOARD: "SIMPLE_BOARD",
    SIMPLE_PATH_EXPLORE : "SIMPLE_PATH_EXPLORE",
    COMPLEX_EXPLORE: "COMPLEX_EXPLORE",
    CREATE_BOARD: "CREATE_BOARD"
  },

  controllerTypes: {
    BASE: "CONTROLLER_BASE",
    STATIC_PROBLEM_STUDY: "STATIC_PROBLEM_STUDY",
    DYNAMIC_PROBLEM_STUDY: "DYNAMIC_PROBLEM_STUDY",
    EXLORE_SOLUTIONS: "EXPLORE_SOLUTIONS",
    EXLORE_GAME: "EXPLORE_GAME"
  },

  transitionTypes: {
    PROBLEM_OVERLAY: "PROBLEM_OVERLAY",
    INSTANT: "INSTANT"
  },

  configTypes: {
    PROBLEM_CONFIG: "PROBLEM_CONFIG"
  },

  // Also sometimes referred to as colors. See util.colors.
  states: {
    BLACK: "BLACK",
    WHITE: "WHITE",
    EMPTY: "EMPTY"
  },

  problemResults: {
    CORRECT: "CORRECT",
    INCORRECT: "INCORRECT",
    INDETERMINATE: "INDETERMINATE"
  },

  // GraphicsTypes: To select between SVG and Rasterized
  graphicsTypes: {
    SVG: "SVG",
    RASTER: "RASTER"
  },

  directions: {
    LEFT: "LEFT",
    RIGHT: "RIGHT",
    TOP: "TOP",
    BOTTOM: "BOTTOM"
  },

  // The directions should work with the boardRegions.
  boardRegions: {
    LEFT: "LEFT",
    RIGHT: "RIGHT",
    TOP: "TOP",
    BOTTOM: "BOTTOM",
    TOP_LEFT: "TOP_LEFT",
    TOP_RIGHT: "TOP_RIGHT",
    BOTTOM_LEFT: "BOTTOM_LEFT",
    BOTTOM_RIGHT: "BOTTOM_RIGHT",
    ALL: "ALL"
  },

  marks: {
    CIRCLE: "CIRCLE",
    LETTER: "LETTER",
    SQUARE: "SQUARE",
    STONE: "STONE",
    TRIANGLE: "TRIANGLE",
    XMARK: "XMARK"
  },

  controllerMessages: {
    CONTINUE: "CONTINUE",
    DONE: "DONE",
    FAILURE: "FAILURE"
  },

  getSubComponentEnums: function(majorType, subType) {
    var comp = otre.enums.components,
        enums = otre.enums,
        out = {};
    if (majorType === comp.CONTROLLER) {
      out = enums.controllerTypes;
    } else if (majorType === comp.DISPLAY) {
      out = enums.displayTypes;
    } else if (majorType === comp.TRANSITION) {
      out = enums.transitionTypes;
    } else {
      throw "Unknown component type: " + majorType;
    }
    return out;
  },
};
var enums = otre.enums;
