// Otre: A Go Studying Program
// Copyright (c) 2011-2013, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License
glift.enums = {
  // TODO(kashomon): Move enums to their own domains
  // Also sometimes referred to as colors. See util.colors.
  states: {
    BLACK: "BLACK",
    WHITE: "WHITE",
    EMPTY: "EMPTY"
  },

  directions: {
    LEFT: "LEFT",
    RIGHT: "RIGHT",
    TOP: "TOP",
    BOTTOM: "BOTTOM"
  },

  controllerMessages: {
    CONTINUE: "CONTINUE",
    DONE: "DONE",
    FAILURE: "FAILURE"
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
    LABEL: "LABEL",
    SQUARE: "SQUARE",
    TRIANGLE: "TRIANGLE",
    XMARK: "XMARK",
  },

  problemResults: {
    CORRECT: "CORRECT",
    INCORRECT: "INCORRECT",
    INDETERMINATE: "INDETERMINATE"
  },

  // TODO(kashomon): Delete these enums. or at least rethink them
  controllerMessages: {
    CONTINUE: "CONTINUE",
    DONE: "DONE",
    FAILURE: "FAILURE"
  },

  controllerTypes: {
    BASE: "CONTROLLER_BASE",
    STATIC_PROBLEM_STUDY: "STATIC_PROBLEM_STUDY",
    DYNAMIC_PROBLEM_STUDY: "DYNAMIC_PROBLEM_STUDY",
    EXLORE_SOLUTIONS: "EXPLORE_SOLUTIONS",
    EXLORE_GAME: "EXPLORE_GAME"
  },

  mediums: {
    SVG: "SVG",
    CANVAS: "CANVAS"
  }
};
