// Otre: A Go Studying Program
// Copyright (c) 2012, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License
glift.enums = {
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

  // Left in for legacy reasons.
  displayTypes: {
    EXPLORE_BOARD: "EXPLORE_BOARD",
    EXPLAIN_BOARD: "EXPLAIN_BOARD",
    SIMPLE_BOARD: "SIMPLE_BOARD"
  }
};
var enums = glift.enums;
