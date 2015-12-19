goog.provide('glift.rules.Move');

/**
 * A type encapsulating the idea of a move.
 *
 * A move can have an undefined point because players may pass.
 *
 * @typedef {{
 *  point: (!glift.Point|undefined),
 *  color: !glift.enums.states
 * }}
 */
glift.rules.Move;
