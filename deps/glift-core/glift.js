/**
 * @preserve Glift: A Responsive Javascript library for the game Go.
 *
 * @copyright Josh Hoak
 * @license MIT License (see LICENSE.txt)
 * --------------------------------------
 */

// Define some closure primitives for compatibility with dev mode. Closure
// compiler works off of regular expressions, so this shouldn't be an issue.
// This allows us to use goog.require and goog.provides in dev mode.
if (window && !window['goog']) {
  window['goog'] = {};
  /** Override default closure function */
  window['goog']['require'] = function(ns) {
  };
  /** Override goog.scope function */
  window['goog']['scope'] = function(fn) { fn(); };
  /** Override goog.provide function */
  window['goog']['provide'] = function(ns) {
  };
}

goog.provide('glift');

(function(w) {

var g;
if (typeof glift !== 'undefined') {
  g = glift;
} else if (typeof w.glift !== 'undefined') {
  g = w.glift;
} else {
  g = {};
}
if (w) {
  // expose Glift as a global.
  w.glift = g;
}
})(window);
